const Installation = require('./models/Installation');

// 1. Calculate 3-Month Installment Breakdown
const calculateInstallmentPlan = (packagePriceUSD) => {
  const markupPercentage = 0.12; // 12% markup for installment plans
  const totalCost = packagePriceUSD * (1 + markupPercentage);
  const monthlyPayment = totalCost / 3;

  return {
    basePrice: packagePriceUSD,
    totalInstallmentCost: Math.round(totalCost),
    monthlyPayment: Math.round(monthlyPayment),
    terms: "3 Monthly Payments. Equipment is dispatched & installation scheduled after Payment 2."
  };
};

// 2. Check Next Available Installation Date
const getNextAvailableInstallationDate = async () => {
  const today = new Date();
  
  // Look for open dates starting tomorrow
  for (let i = 1; i <= 14; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    checkDate.setHours(0, 0, 0, 0);

    let schedule = await Installation.findOne({ date: checkDate });

    if (!schedule) {
      // Date is completely free
      return checkDate.toISOString().split('T')[0];
    } else if (schedule.bookedSlots < schedule.maxSlots) {
      // Date has open slots remaining
      return checkDate.toISOString().split('T')[0];
    }
  }

  return "No free installation slots available in the next 14 days. Please contact our team directly.";
};

module.exports = { calculateInstallmentPlan, getNextAvailableInstallationDate };