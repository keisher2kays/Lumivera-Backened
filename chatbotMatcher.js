


// backend-lumivera/chatbotMatcher.js
const { packages, products, faqs, greetings, overview, calculateInstallment } = require('./knowledgeData');

// Escape regex special characters in a keyword before building a pattern from it
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word-boundary matching (not raw substring) so short words like "uk" don't
// accidentally match inside unrelated text, and multi-word phrases score
// much higher than single generic words — specificity wins.
const scoreMatch = (query, keywords) => {
  let score = 0;
  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();
    const wordCount = kwLower.split(' ').length;
    const pattern = new RegExp(`\\b${escapeRegex(kwLower)}\\b`);
    if (pattern.test(query)) {
      score += wordCount * wordCount; // 1 word = 1pt, 2 words = 4pt, 3 words = 9pt
    }
  }
  return score;
};

// Build one flat list of every possible answer, tagged by type,
// then score them ALL and pick the single strongest match —
// instead of checking categories in a fixed order (which is what
// caused the wrong FAQ to win before).
const buildCandidates = () => {
  const candidates = [];

  candidates.push({ type: 'greeting', keywords: greetings.keywords, entry: greetings });
  candidates.push({ type: 'overview', keywords: overview.keywords, entry: overview });

  packages.forEach((p) => candidates.push({ type: 'package', keywords: p.keywords, entry: p }));
  faqs.forEach((f) => candidates.push({ type: 'faq', keywords: f.keywords, entry: f }));
  products.forEach((p) =>
    candidates.push({ type: 'product', keywords: [...p.keywords, p.name.toLowerCase()], entry: p })
  );

  return candidates;
};

const formatPackageReply = (pkg) => {
  const inst = calculateInstallment(pkg.priceUSD);
  return (
    `Yes, we have that one! **${pkg.name}** (${pkg.spec}) — USD ${pkg.priceUSD.toLocaleString()} (Zimbabwe) / £${pkg.priceGBP.toLocaleString()} (UK)\n` +
    `Best for: ${pkg.bestFor}\n` +
    `Includes: ${pkg.includes.join(', ')}\n` +
    `Or pay in 3 installments: ~$${inst.monthly}/month (total $${inst.total}).\n` +
    `Want to place this order or ask about another package?`
  );
};

const formatProductReply = (p) => {
  return `Yes, we stock that! **${p.name}** — $${p.priceUSD.toLocaleString()}. Want to know installment pricing or place an order?`;
};

const answerQuery = (userMessage) => {
  const query = userMessage.toLowerCase().trim();

  // Very short messages are almost always greetings — check that fast path first
  if (query.length <= 20) {
    const greetingScore = scoreMatch(query, greetings.keywords);
    if (greetingScore > 0) {
      return { text: greetings.answer(), handover: false };
    }
  }

  const candidates = buildCandidates();
  let best = null;
  let bestScore = 0;

  for (const c of candidates) {
    const score = scoreMatch(query, c.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  if (best) {
    switch (best.type) {
      case 'overview':
        return { text: best.entry.answer(), handover: false };
      case 'package':
        return { text: formatPackageReply(best.entry), handover: false };
      case 'faq':
        return { text: best.entry.answer(), handover: false };
      case 'product':
        return { text: formatProductReply(best.entry), handover: false };
      default:
        break;
    }
  }

  // Nothing matched well enough — hand over to a human, politely,
  // and set expectations since the team spans different time zones.
  return {
    text: "That's a great question, and I want to make sure you get the right answer rather than guess. " +
          "I'm connecting you with a member of the LumiVera team — since we support customers across different time zones, " +
          "it may take a little while for someone to respond, but your message won't be missed. " +
          "Feel free to leave your **phone number or email** so they can reach you directly. 🙏",
    handover: true,
  };
};

module.exports = { answerQuery };