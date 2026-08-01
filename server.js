

// backend-lumivera/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const connectDB = require('./config/db');
const Product = require('./models/Product');
const Lead = require('./models/Lead');
const Installation = require('./models/Installation');

const adminRoutes = require('./adminRoutes');
const { calculateInstallmentPlan } = require('./installmentHelper');
const { askChatbotAI } = require('./chatbotAI');
const { getNextAvailableDate, formatDateReadable, bookInstallationSlot } = require('./scheduling');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());

// --- STRIPE WEBHOOK (Must be before express.json) ---
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const leadId = session.metadata?.leadId;
    try {
      if (leadId) await Lead.findByIdAndUpdate(leadId, { status: 'Paid' });
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const orderSummary = lineItems.data.map(i => `${i.description} x${i.quantity}`).join(', ');

      // Decrement stock for any purchased item that matches a Product by name
      for (const li of lineItems.data) {
        const matched = await Product.findOne({ name: li.description });
        if (matched) {
          const newQty = Math.max(0, (matched.stockQuantity || 0) - li.quantity);
          matched.stockQuantity = newQty;
          matched.inStock = newQty > 0;
          await matched.save();
        }
      }

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'f3e19cf2-449a-4fbb-8145-26b44a0c5cb2',
          subject: `✅ PAID ORDER — ${session.metadata?.customerName} — ${session.metadata?.location}`,
          from_name: 'LumiVera Website',
          name: session.metadata?.customerName,
          email: session.customer_details?.email || session.metadata?.customerEmail,
          phone: session.metadata?.customerPhone,
          location: session.metadata?.location,
          order_summary: orderSummary,
          order_total: `${(session.amount_total / 100).toLocaleString()} ${session.currency.toUpperCase()}`,
          payment_type: 'Paid via Stripe',
          payment_id: session.id,
          message: `PAID ORDER:\nName: ${session.metadata?.customerName}\nEmail: ${session.customer_details?.email}\nPhone: ${session.metadata?.customerPhone}\nLocation: ${session.metadata?.location}\nItems: ${orderSummary}\nTotal: ${(session.amount_total / 100)} ${session.currency}\nStripe ID: ${session.id}`
        })
      });
    } catch (err) { console.error('Webhook error', err.message); }
  }
  res.json({ received: true });
});

app.use(express.json());
app.use('/api/admin', adminRoutes);

// --- PUBLIC STOCK CHECK (no auth needed — just name/inStock/quantity) ---
// Used by the storefront to silently check availability before adding an item to cart.
app.get('/api/stock', async (req, res) => {
  try {
    const products = await Product.find({}, 'name stockQuantity inStock');
    const stockMap = {};
    products.forEach((p) => {
      stockMap[p.name] = { inStock: p.inStock, stockQuantity: p.stockQuantity };
    });
    res.json(stockMap);
  } catch (err) {
    console.error('Error fetching stock:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching stock' });
  }
});

// --- CREATE CHECKOUT SESSION ---
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customerEmail, customerName, customerPhone, location, successUrl, cancelUrl } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart empty' });
    if (!customerName || !customerEmail || !customerPhone || !location) return res.status(400).json({ error: 'Missing details' });

    const currencies = [...new Set(items.map(i => i.region === 'uk' ? 'gbp' : 'usd'))];
    if (currencies.length > 1) return res.status(400).json({ error: 'Cannot mix UK (£) and Zim (USD) in one payment' });

    const isValidHttpUrl = (s) => { try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (_) { return false; } };

    const line_items = items.map((item) => ({
      price_data: {
        currency: item.region === 'uk' ? 'gbp' : 'usd',
        product_data: {
          name: item.name,
          description: `${item.spec || ''} (${item.region === 'uk' ? 'UK' : 'Zim'})`.trim(),
          ...(item.image && isValidHttpUrl(item.image) ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round((item.priceValue || 0) * 100),
      },
      quantity: item.quantity,
    }));

    const orderSummary = items.map(i => `${i.name} x${i.quantity}`).join(', ');
    const lead = await Lead.create({
      customerName, phoneOrEmail: customerEmail, contact: customerEmail,
      notes: `Stripe pending — ${customerName}, ${customerPhone}, ${location}. Items: ${orderSummary}`,
      status: 'Pending Payment'
    });

    const clientOrigin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3001';
    const finalSuccessUrl = successUrl || `${clientOrigin}/?payment=success&cart=open`;
    const finalCancelUrl = cancelUrl || `${clientOrigin}/?payment=cancelled&cart=open`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: { leadId: lead._id.toString(), customerName, customerEmail, customerPhone, location }
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- CHATBOT ---
const activeHandovers = new Set();
const roomMessageHistory = new Map();
const roomBookingState = new Map();

const parseNameAndPhone = (text) => {
  const m = text.match(/\+?\d{7,15}/);
  if (!m) return null;
  const phone = m[0];
  const name = text.replace(phone, '').replace(/[,]/g, '').trim();
  if (!name) return null;
  return { name, phone };
};

const handleChatResponse = async (userMessage, roomId) => {
  const q = userMessage.toLowerCase().trim();

  if (roomBookingState.has(roomId)) {
    const p = roomBookingState.get(roomId);
    const parsed = parseNameAndPhone(userMessage);
    if (!parsed) return { text: `I just need your name and phone — e.g. "Tendai Moyo, 0771234567".`, handover: false };
    const r = await bookInstallationSlot({ date: p.proposedDate, clientName: parsed.name, phone: parsed.phone });
    roomBookingState.delete(roomId);
    if (!r.success) return { text: `${r.message} Want another date?`, handover: false };
    return { text: `Booked, ${parsed.name}! 🎉 ${formatDateReadable(p.proposedDate)}.`, handover: false };
  }

  const needsHuman = ['sales', 'call', 'human', 'contact', 'real person', 'talk to', 'agent'].some(k => q.includes(k));
  if (needsHuman) {
    activeHandovers.add(roomId);
    return { text: "Connecting you to a specialist now! Please stay on the line.", handover: true };
  }

  if (['schedule', 'free day', 'available', 'slot', 'book', 'date', 'appointment'].some(k => q.includes(k))) {
    const nd = await getNextAvailableDate();
    if (!nd) {
      activeHandovers.add(roomId);
      return { text: "Fully booked next month! Let me connect you to our team.", handover: true };
    }
    roomBookingState.set(roomId, { proposedDate: nd });
    return { text: `Next available is **${formatDateReadable(nd)}**. Reply with name + phone to lock it in.`, handover: false };
  }

  const re = /(?:\+?\d{7,15}|[\w.-]+@[\w.-]+\.\w+)/;
  if (re.test(q)) {
    const c = q.match(re)[0];
    try { await Lead.create({ phoneOrEmail: c, notes: `From chat ${roomId}: "${userMessage}"`, status: 'bot_chatting' }); } catch (e) { }
    return { text: `Thanks! Logged ${c}. Specialist will reach out.`, handover: false };
  }

  // Everything else — ask Claude, using this room's recent conversation as context
  const history = roomMessageHistory.get(roomId) || [];
  const aiResponse = await askChatbotAI(userMessage, history);

  if (aiResponse.needs_human) activeHandovers.add(roomId);

  return { text: aiResponse.reply, handover: aiResponse.needs_human };
};

io.on('connection', (socket) => {
  socket.on('join_room', (id) => socket.join(id));
  socket.on('send_message', async (data) => {
    const { roomId, message, sender } = data;
    if (!roomMessageHistory.has(roomId)) roomMessageHistory.set(roomId, []);
    roomMessageHistory.get(roomId).push({ sender, text: message });
    if (sender === 'agent') activeHandovers.add(roomId);
    io.to(roomId).emit('receive_message', { sender, text: message, timestamp: new Date() });
    if (activeHandovers.has(roomId) && sender !== 'agent') return;
    if (sender === 'user') {
      const res = await handleChatResponse(message, roomId);
      socket.emit('typing_status', { isTyping: true, sender: 'bot' });
      setTimeout(() => {
        socket.emit('typing_status', { isTyping: false, sender: 'bot' });
        roomMessageHistory.get(roomId).push({ sender: 'bot', text: res.text });
        io.to(roomId).emit('receive_message', { sender: 'bot', text: res.text, timestamp: new Date() });
        if (res.handover) io.emit('agent_notification', { roomId, message: `Live agent needed in ${roomId}: "${message}"` });
      }, 1000);
    }
  });
  socket.on('typing', (d) => {
    socket.to(d.roomId).emit('typing_status', { isTyping: d.isTyping, sender: d.sender });
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'LumiVera Server Operational' }));
server.listen(PORT, () => console.log(`⚡ Server on ${PORT} ::`));