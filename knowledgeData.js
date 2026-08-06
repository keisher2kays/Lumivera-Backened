

const INSTALLMENT_MARKUP = 0.12;

const calculateInstallment = (baseValue) => {
  const total = Math.round(baseValue * (1 + INSTALLMENT_MARKUP));
  const monthly = Math.round(total / 3);
  return { total, monthly };
};

const packages = [
  {
    name: 'Basic Package',
    keywords: ['basic', 'basic package', 'cheapest', 'entry level', 'starter'],
    priceUSD: 1160,
    priceGBP: 4500,
    spec: '3.5kW Kit',
    includes: ['4.5kW Hybrid Inverter', '24V 100Ah LiFePO4 Lithium Battery', '4x 450W Mono Solar Panels', 'Cabling & Protection Kit'],
    bestFor: 'essential home backup — lights, Wi-Fi, entertainment',
  },
  {
    name: 'Standard Package',
    keywords: ['standard', 'standard package', 'medium', 'recommended', 'most popular'],
    priceUSD: 3350,
    priceGBP: 14000,
    spec: '6.2kW Kit',
    includes: ['WHC 6.2kW Hybrid Inverter', '48V 200Ah Lithium Battery', '9x 590W Mono Solar Panels', 'Full DC/AC Protection Box & Accessories'],
    bestFor: 'medium households managing regular load-shedding cycles',
  },
  {
    name: 'Premium Package',
    keywords: ['premium', 'premium package', 'biggest', 'largest', 'top', 'commercial', 'estate'],
    priceUSD: 6450,
    priceGBP: 24500,
    spec: '11kW Kit',
    includes: ['11kW Flagship Hybrid Inverter', '10.2kWh/15.3kWh Lithium LiFePO4 Battery', '12x 590W Mono Solar Panels', 'Heavy Duty Protection Kit & Cables'],
    bestFor: 'heavy residential estates, boreholes, commercial self-sufficiency',
  },
   {
    name: "Power 11kW Package",
    bestFor: "Entry tier for heavy residential estates and small commercial self-sufficiency",
     keywords: ['Entry', 'Power 11kW Package', 'self sufficiency', 'heavy residential', 'small', 'commercial', 'estate'],
     priceUSD: 4300,
    priceGBP: 17500,
    spec: "11kW Kit — Basic",
    includes: [
      "11kW Hybrid Inverter",
      "10.2kWh Lithium LifePO4 Battery",
      "12 x 450W Mono Solar Panels",
      "Standard Protection Kit & Cables"
    ]
  },
    {
    name: "Essential 6.2kW Package",
    bestFor: "Entry point into whole-home coverage — lights, fridge, Wi-Fi, and small appliances",
    keywords: ['whole-home', 'essential 6.2kW Package', 'lights', 'small appliances', 'backup', 'fridge', 'entertainment' , 'whole home', 'coverage', 'reasonable'],
    priceUSD: 2150,
    priceGBP: 9000,
    spec: "6.2kW Kit — Basic",
    includes: [
      "WHC 6.2kW Hybrid Inverter",
      "48V 100Ah Lithium Battery",
      "9 x 450W Mono Solar Panels",
      "Standard DC/AC Protection Box"
    ]
  },
];

const products = [
  { name: 'Polycrystalline Solar Panel 330W', keywords: ['polycrystalline', 'poly panel', '330w', 'cheapest panel'], priceUSD: 80 },
  { name: 'Monocrystalline Solar Panel 400W', keywords: ['400w panel', 'monocrystalline 400'], priceUSD: 95 },
  { name: 'Monocrystalline Solar Panel 550W', keywords: ['550w panel', 'monocrystalline 550', 'main panel'], priceUSD: 120 },
  { name: 'Canadian Solar Monocrystalline Panel 545W', keywords: ['canadian solar', '545w'], priceUSD: 135 },
  { name: 'Bifacial Solar Panel 600W', keywords: ['bifacial', '600w panel'], priceUSD: 145 },
  { name: 'Off-Grid Solar Inverter 1kVA', keywords: ['1kva', 'off grid inverter', 'small inverter'], priceUSD: 180 },
  { name: 'Hybrid Solar Inverter 5kVA', keywords: ['5kva', '5kva inverter', 'hybrid inverter','small','smallest'], priceUSD: 700 },
  { name: 'Hybrid Solar Inverter 8kVA', keywords: ['8kva', '8kva inverter', 'reasonable'], priceUSD: 1100 },
  { name: '3-Phase Hybrid Inverter 12kVA', keywords: ['12kva', '3 phase', 'three phase','medium'], priceUSD: 1550 },
  { name: 'Industrial Hybrid Inverter 20kVA', keywords: ['20kva', 'industrial inverter' , 'biggest' ,'largest'], priceUSD: 3300 },
  { name: 'Lithium Battery 5kWh (100Ah)', keywords: ['5kwh', '100ah', 'small battery'], priceUSD: 480 },
  { name: 'Lithium Battery 10kWh (200Ah)', keywords: ['10kwh', '200ah'], priceUSD: 850 },
  { name: 'Lithium Battery 15kWh (300Ah)', keywords: ['15kwh', '300ah'], priceUSD: 1350 },
  { name: 'Lithium Battery 20kWh (400Ah)', keywords: ['20kwh', '400ah', 'biggest battery', 'industrial battery'], priceUSD: 3200 },
  { name: 'Inspection Quadcopter Drone', keywords: ['inspection drone', 'quadcopter','drones'], priceUSD: 850 },
  { name: 'Agricultural Spraying Drone 16L', keywords: ['spraying drone', '16l drone', 'crop drone','drones'], priceUSD: 1650 },
  { name: 'Mapping & Survey Drone', keywords: ['mapping drone', 'survey drone', 'gps drone','drones'], priceUSD: 2200 },
  { name: 'Heavy-Duty Spraying Drone 25kg', keywords: ['25kg drone', 'heavy duty drone','drones'], priceUSD: 2800 },
  { name: 'Installation & Mounting Kit', keywords: ['mounting kit', 'installation kit', 'rails'], priceUSD: 225 },
  { name: 'MPPT Charge Controller 60A', keywords: ['mppt', 'charge controller'], priceUSD: 95 },
  { name: 'Solar Cables & Combiner Box', keywords: ['combiner box', 'solar cables'], priceUSD: 65 },
  { name: 'Surge Protection Device', keywords: ['surge protector', 'surge protection'], priceUSD: 40 },
  { name: 'DC Circuit Breakers (set of 4)', keywords: ['circuit breaker', 'dc breaker'], priceUSD: 35 },
  { name: 'Battery Monitor Display', keywords: ['battery monitor', 'monitor display'], priceUSD: 60 },
  { name: 'LED Solar Lighting Kit', keywords: ['led kit', 'lighting kit', 'led lights'], priceUSD: 30 },
  { name: 'KD5 (KL8LM) Premium Caplamp', keywords: ['kd5', 'kl8lm', 'premium caplamp', 'miner lamp', 'caplamp'], priceUSD: 125 },
  { name: 'Lunar Plus Miner Caplamp', keywords: ['lunar plus', 'lunar plus caplamp', 'miner caplamp'], priceUSD: 120 },
  { name: 'KL4LM Mining Torch with Charger', keywords: ['kl4lm', 'mining torch', 'kl4lm torch'], priceUSD: 45 },
  { name: 'Lunar Lite Caplamp', keywords: ['lunar lite', 'lunar lite caplamp'], priceUSD: 75 },
  { name: 'KL2LM Miner Caplamp', keywords: ['kl2lm', 'kl2lm caplamp', 'cheapest miner lamp'], priceUSD: 30 },
];

const overview = {
  keywords: [
    'all package', 'all the package', 'all packages', 'what packages', 'which packages',
    'list of package', 'package options', 'package list', 'compare package', 'tell me about your package',
    'more details about all', 'show me the packages', 'what do you offer', 'what do you sell',
    'what products do you have', 'options do you have', 'what can i buy', 'what solutions do you have',
  ],
  answer: () => {
    const lines = packages.map((pkg) => {
      const inst = calculateInstallment(pkg.priceUSD);
      return `• **${pkg.name}** (${pkg.spec}) — $${pkg.priceUSD.toLocaleString()} / £${pkg.priceGBP.toLocaleString()} — or ~$${inst.monthly}/mo over 3 months. Best for: ${pkg.bestFor}.`;
    });
    return (
      `Sure, happy to walk you through them! Here's a quick overview of our 3 packages:\n\n${lines.join('\n')}\n\n` +
      `We also sell individual solar panels, inverters, batteries, drones, mining cap lamps, and accessories separately if a full package isn't what you need. ` +
      `Want full specs on any one of these, or details on installment pricing?`
    );
  },
};

const greetings = {
  keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'morning', 'evening', 'howzit', 'hie', 'good day'],
  answer: () =>
    `Hello! 👋 Welcome to LumiVera Green Energy. I can help with package pricing, product specs, installment plans, payments, or installation questions. What would you like to know?`,
};

const faqs = [
  {
    keywords: ['installment', 'installments', 'pay monthly', 'payment plan', 'monthly payment', 'deposit', 'instalment'],
    answer: () =>
      `Yes, we do! We offer a 3-month installment plan on any package. A 12% markup is applied to the base price to cover the plan. ` +
      `For example — Standard Package: base $2,250, installment total ≈ $${calculateInstallment(2250).total}, so about $${calculateInstallment(2250).monthly}/month over 3 months. ` +
      `Equipment is dispatched and installation is scheduled right after your 2nd payment. Want the breakdown for a specific package?`,
  },
  {
    keywords: [
      'payment method', 'how do i pay', 'ecocash', 'paynow', 'visa', 'mastercard',
      'pay with', 'card payment', 'debit card', 'credit card', 'bank card',
      'online payment', 'pay online', 'secure payment', 'is it safe to pay',
      'pay by card', 'bank transfer', 'which cards', 'accepted cards'
    ],
    answer: () =>
      `Yes, absolutely — payment is quick and secure. We accept online payments through our Paynow gateway, using Visa, or Mastercard — ` +
      `and Paynow also supports most other major bank cards, so if yours isn't Visa or Mastercard it will likely still work. ` +
      `Your card details are never stored on our end. Would you like help placing an order, or do you have a question about a specific package?`,
  },
  {
    keywords: [
      'pay from abroad', 'pay from uk', 'pay from overseas', 'family abroad', 'pay for my family',
      'pay for parents', 'send money', 'diaspora', 'living abroad', 'pay from outside zimbabwe',
      'someone in uk pay', 'i am in the uk', 'i live in the uk', 'i am abroad',
      'sister', 'brother', 'my family', 'my parents', 'my relative', 'relative in zimbabwe',
      'back home', 'loved ones', 'pay for someone', 'buy for someone', 'pay on their behalf',
      'someone else pay', 'overseas pay', 'living overseas', 'pay for them', 'uk customers',
      'serve uk', 'ship to uk', 'international customers', 'from another country', 'abroad pay',
    ],
    answer: () =>
      `Yes, definitely — this is actually one of the most common ways our customers order! If you're abroad, you can pay directly online via Paynow using your Visa or Mastercard, ` +
      `select your family's details as the delivery/installation address in Zimbabwe, and our team handles the installation on the ground. ` +
      `No need to send cash through separate channels. Would you like help getting started with an order for a specific location?`,
  },
  {
    keywords: ['borehole', 'drill', 'water', 'well'],
    answer: () => `Yes, we do boreholes too! We provide borehole drilling and solar pump installation services. Leave your phone number or email and our team will reach out to schedule a site survey.`,
  },
  {
    keywords: ['warranty', 'guarantee', 'covered'],
    answer: () => `Yes, our products are covered — our monocrystalline and Canadian Solar panels carry a 25-year linear performance warranty (12-year product warranty on the Canadian Solar range). For warranty details on other products, our team can confirm specifics for your order — want me to connect you?`,
  },
  {
    keywords: ['customize', 'custom', 'change package', 'modify'],
    answer: () => `Yes, definitely — all packages can be customized to suit your specific needs and budget. Our team can help tailor one for you.`,
  },
  {
    keywords: ['united kingdom', 'britain', 'england', 'registered company', 'legit', 'legitimate', 'trustworthy', 'scam', 'real company', 'is this real'],
    answer: () =>
      `Yes, we're the real deal! LumiVera Green Energy is a UK-registered company serving customers across Zimbabwe. We deliver trusted solar solutions to homes, businesses, and communities — ` +
      `and we're set up so customers abroad can fund installations for family back home with ease. Happy to answer any specific question about how an order works.`,
  },
  {
    keywords: [
      'how does it work', 'how do i order', 'how to order', 'how does ordering work', 'process',
      'how do i buy', 'steps to order', 'how does installation work', 'installation process'
    ],
    answer: () =>
      `Sure, here's how it works: 1) Pick a package or product on our site (or ask me for a recommendation), 2) Pay in full or choose the 3-month installment plan via Paynow, ` +
      `3) After payment (or your 2nd installment), we schedule your installation date, 4) Our certified team installs on-site. Want help picking a package to start with?`,
  },
  {
    keywords: [
      'delivery time', 'how long does delivery take', 'how long does installation take',
      'shipping time', 'when will it arrive', 'turnaround time', 'how fast'
    ],
    answer: () =>
      `Good question — installation timing depends on your location and current scheduling, but generally we can get you on the calendar shortly after payment is confirmed (or after your 2nd installment on a payment plan). ` +
      `For an exact date, I can connect you with our team, or you can ask me for the next available installation slot.`,
  },
  {
    keywords: [
      'where are you located', 'where are you based', 'office location', 'address', 'where is your office',
      'contact number', 'phone number', 'email address', 'how do i contact you',
    ],
    answer: () =>
      `We're a UK-registered company serving customers across Zimbabwe. Since we support customers in different time zones, our live chat here is available anytime — ` +
      `if you need to speak with a specific team member or need exact contact details, I can connect you with our team directly. Want me to do that?`,
  },
  {
    keywords: [
      'business hours', 'opening hours', 'are you open', 'what time do you open', 'when do you open',
      'when are you open', 'opening time', 'closing time', 'hours of operation', 'operating hours',
      'are you available', 'when can i reach you', 'what time', 'office hours', 'when do you close',
    ],
    // TODO: fill in real hours below once confirmed, e.g. "Monday–Saturday, 8am–6pm CAT"
    answer: () =>
      `Yes, we're here! Since we serve customers across different time zones, this chat is available anytime — if I can't fully answer something, ` +
      `I'll connect you with our team and they'll get back to you as soon as they're online.`,
  },
  {
    keywords: ['who are you', 'what is lumivera', 'about lumivera', 'about you', 'what does lumivera do', 'tell me about your company'],
    answer: () =>
      `Great question! LumiVera Green Energy is a UK-registered renewable energy company delivering solar power solutions — plus boreholes, agricultural drones, and mining lighting — to homes, businesses, and communities across Zimbabwe. ` +
      `We offer full packages, individual components, and flexible payment options including installments. What would you like to know more about?`,
  },
];

module.exports = { packages, products, faqs, greetings, overview, calculateInstallment };