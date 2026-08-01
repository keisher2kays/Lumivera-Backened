// backend-lumivera/chatbotAI.js
const { packages, products, faqs, calculateInstallment } = require('./knowledgeData');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-5';

// Build the knowledge base text automatically from knowledgeData.js
// so you only ever maintain product/FAQ info in one place.
const buildKnowledgeBaseText = () => {
  const packageLines = packages
    .map((pkg) => {
      const inst = calculateInstallment(pkg.priceUSD);
      return `- ${pkg.name} (${pkg.spec}): $${pkg.priceUSD} (Zimbabwe) / £${pkg.priceGBP} (UK). Best for: ${pkg.bestFor}. Includes: ${pkg.includes.join(', ')}. Installment: ~$${inst.monthly}/month over 3 months (total $${inst.total}).`;
    })
    .join('\n');

  const productLines = products
    .map((p) => `- ${p.name}: $${p.priceUSD}`)
    .join('\n');

  const faqLines = faqs.map((f) => `- ${f.answer()}`).join('\n');

  return `
PACKAGES:
${packageLines}

INDIVIDUAL PRODUCTS:
${productLines}

COMPANY FAQS:
${faqLines}

INSTALLMENT PLAN: 3 monthly payments, 12% markup on base price. Equipment dispatched and installation scheduled after 2nd payment.
PAYMENT: Paynow gateway — EcoCash, Visa, Mastercard, most other major bank cards.
`;
};

const SYSTEM_PROMPT = `You are the LumiVera Green Energy customer support assistant, chatting with a potential or existing customer on the website.

Answer ONLY using the information in the KNOWLEDGE BASE below. Do not invent prices, specs, policies, or timelines that aren't in it.

Rules:
- Be warm, concise, and human — never robotic. Open with natural affirmations like "Yes, definitely!" or "Great question!" where it fits.
- If the answer is fully covered by the knowledge base, answer confidently and set needs_human to false.
- If the question is about something NOT covered in the knowledge base, or requires account-specific info (e.g. "where is my order"), set needs_human to true and reason should briefly say why.
- If the customer seems frustrated, confused, or explicitly asks for a person, set needs_human to true.
- Never make up information to avoid saying "I'm not sure."
- Keep replies short — this is a live chat, not an essay. When listing all packages, keep each one to one line.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{"reply": "...", "needs_human": true or false, "reason": "..."}

KNOWLEDGE BASE:
${buildKnowledgeBaseText()}
`;

async function askChatbotAI(userMessage, conversationHistory = []) {
  const messages = [
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  let rawText = '';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (data?.error) {
      console.error('Anthropic API returned an error:', data.error);
      return {
        reply: "I'm having trouble processing that right now — connecting you with a LumiVera specialist.",
        needs_human: true,
        reason: `API error: ${data.error.message || 'unknown'}`,
      };
    }

    // The content array can include non-text blocks (e.g. "thinking") before
    // the actual reply — find the block that's actually type "text" rather
    // than assuming it's always at index 0.
    const textBlock = (data?.content || []).find((block) => block.type === 'text');
    rawText = textBlock?.text || '';

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      reply: parsed.reply || "I'm not sure about that — let me get a specialist to help you.",
      needs_human: !!parsed.needs_human,
      reason: parsed.reason || '',
    };
  } catch (err) {
    console.error('Chatbot AI error:', err.message);
    console.error('Raw response was:', rawText);
    return {
      reply: "I'm having trouble processing that right now — connecting you with a LumiVera specialist.",
      needs_human: true,
      reason: 'AI call failed',
    };
  }
}

module.exports = { askChatbotAI };