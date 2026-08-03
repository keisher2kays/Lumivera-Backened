



const express = require('express');
const router = express.Router();

const Installation = require('./models/Installation');
const Lead = require('./models/Lead');
const User = require('./models/User');
const Product = require('./models/Product');

const { bookInstallationSlot } = require('./scheduling');

// ==========================================
// TEAM / USER MANAGEMENT ROUTES
// ==========================================

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ success: false, message: 'Server connection error.' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }
    let formattedRole = 'sales_rep';
    if (role === 'Administrator' || role === 'admin') formattedRole = 'admin';

    const newUser = await User.create({ 
      name, 
      username, 
      password, 
      plainPassword: password,
      role: formattedRole 
    });

    return res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      user: { _id: newUser._id, name: newUser.name, username: newUser.username, role: newUser.role, plainPassword: newUser.plainPassword },
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server connection error.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, message: 'Team member deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Server connection error.' });
  }
});

router.get('/team', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(users);
});

router.post('/team', async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) return res.status(400).json({ success: false, message: 'All fields are required.' });
  let formattedRole = 'sales_rep';
  if (role === 'Administrator' || role === 'admin') formattedRole = 'admin';
  try {
    const newUser = await User.create({ name, username, password, plainPassword: password, role: formattedRole });
    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/team/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, message: 'Team member deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server connection error.' });
  }
});

// ==========================================
// AUTHENTICATION ROUTE
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      return res.status(200).json({ success: true, message: 'Login successful', token: 'admin-session-token-12345', user: { username, role: 'admin' } });
    }
    const dbUser = await User.findOne({ username, password });
    if (dbUser) {
      return res.status(200).json({ success: true, message: 'Login successful', token: 'user-session-token', user: { name: dbUser.name, username: dbUser.username, role: dbUser.role } });
    }
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

// ==========================================
// LEADS ROUTES
// ==========================================
router.get('/leads', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) { res.status(500).json({ success: false, message: 'Error fetching leads' }); }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead removed' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error deleting lead' }); }
});

// ==========================================
// PRODUCTS / INVENTORY ROUTES
// ==========================================
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ success: false, message: 'Error fetching products' }); }
});

router.post('/products', async (req, res) => {
  try {
    const { name, category, priceZimUSD, priceUKGBP, stockQuantity, description, specs } = req.body;
    if (!name || !category || priceZimUSD === undefined || priceZimUSD === '') return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    const qty = stockQuantity !== undefined && stockQuantity !== '' ? Number(stockQuantity) : 0;
    const product = await Product.create({
      name, category, priceZimUSD: Number(priceZimUSD), priceUKGBP: priceUKGBP ? Number(priceUKGBP) : undefined,
      stockQuantity: qty, inStock: qty > 0, description, specs: specs ? specs.split(',').map((s) => s.trim()).filter(Boolean) : [],
    });
    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: `${deleted.name} deleted successfully` });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error deleting product' }); }
});

router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined) return res.status(400).json({ success: false, message: 'stockQuantity is required' });
    const qty = Math.max(0, Number(stockQuantity));
    const updated = await Product.findByIdAndUpdate(req.params.id, { stockQuantity: qty, inStock: qty > 0 }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error updating stock' }); }
});

// ==========================================
// INSTALLATIONS ROUTES
// ==========================================
router.get('/installations', async (req, res) => {
  try {
    const installations = await Installation.find({}).sort({ date: 1 });
    res.json(installations);
  } catch (err) { res.status(500).json({ success: false, message: 'Error fetching installations' }); }
});

router.delete('/installations/:instId/clients/:clientId', async (req, res) => {
  try {
    const { instId, clientId } = req.params;
    const installation = await Installation.findById(instId);
    if (!installation) return res.status(404).json({ success: false, message: 'Installation day not found' });
    const before = installation.clients.length;
    installation.clients = installation.clients.filter((c) => c._id.toString() !== clientId);
    if (installation.clients.length === before) return res.status(404).json({ success: false, message: 'Client booking not found' });
    installation.bookedSlots = Math.max(0, installation.bookedSlots - 1);
    installation.isAvailable = installation.bookedSlots < installation.maxSlots;
    await installation.save();
    res.json({ success: true, message: 'Booking removed', data: installation });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error removing booking' }); }
});

// ==========================================
// BOOKING & INSTALLMENT ROUTES
// ==========================================
router.post('/bookings', async (req, res) => {
  try {
    const { customerName, customerPhone, location, notes, items, totalAmount, scheduledDate } = req.body;
    if (!scheduledDate) return res.status(400).json({ success: false, message: 'A scheduled date is required.' });
    const packageName = items && items.length > 0 ? items.map((i) => `${i.name} (x${i.quantity})`).join(', ') : 'Cart Checkout Package';
    const targetDate = new Date(scheduledDate);
    let installation = await Installation.findOne({ date: { $gte: new Date(targetDate.setHours(0, 0, 0, 0)), $lt: new Date(targetDate.setHours(23, 59, 59, 999)) } });
    if (!installation) {
      installation = await Installation.create({ date: new Date(scheduledDate), maxSlots: 2, bookedSlots: 0, isAvailable: true, clients: [] });
    }
    if (installation.bookedSlots >= installation.maxSlots || !installation.isAvailable) return res.status(400).json({ success: false, message: 'Selected date is fully booked.' });
    installation.clients.push({ clientName: customerName, phone: customerPhone, packageName: `${packageName} | Location: ${location || 'N/A'} | Notes: ${notes || 'None'} | Total: ${totalAmount || ''}` });
    installation.bookedSlots += 1;
    if (installation.bookedSlots >= installation.maxSlots) installation.isAvailable = false;
    await installation.save();
    return res.status(201).json({ success: true, message: 'Installation slot successfully booked!', data: installation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error saving booking', error: error.message });
  }
});

router.get('/bookings/installments', async (req, res) => {
  try {
    const schedule = await Installation.find({ bookedSlots: { $gt: 0 } }).sort({ date: 1 });
    return res.status(200).json({ success: true, count: schedule.length, data: schedule });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to fetch schedule' }); }
});

router.get('/bookings', async (req, res) => {
  try {
    const allInstallations = await Installation.find().sort({ date: 1 });
    return res.status(200).json({ success: true, data: allInstallations });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to retrieve installations' }); }
});

module.exports = router;