// backend-lumivera/scheduling.js
const Installation = require('./models/Installation');

const MAX_SLOTS_PER_DAY = 2; // matches your Installation model's default maxSlots

// Find the next calendar date (starting tomorrow) that still has an open slot
const getNextAvailableDate = async () => {
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    checkDate.setHours(0, 0, 0, 0);

    const schedule = await Installation.findOne({ date: checkDate });

    if (!schedule) return checkDate; // nothing booked yet that day
    if (schedule.bookedSlots < schedule.maxSlots) return checkDate; // still has room
  }

  return null; // fully booked for the next 30 days
};

const formatDateReadable = (date) =>
  date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Actually reserve a slot on a given date for a client
const bookInstallationSlot = async ({ date, clientName, phone, packageName }) => {
  let schedule = await Installation.findOne({ date });

  if (!schedule) {
    schedule = new Installation({
      date,
      maxSlots: MAX_SLOTS_PER_DAY,
      bookedSlots: 0,
      isAvailable: true,
      clients: [],
    });
  }

  if (schedule.bookedSlots >= schedule.maxSlots) {
    return { success: false, message: 'That date just filled up — please pick another date.' };
  }

  schedule.clients.push({ clientName, phone, packageName: packageName || 'Not specified' });
  schedule.bookedSlots += 1;
  schedule.isAvailable = schedule.bookedSlots < schedule.maxSlots;

  await schedule.save();
  return { success: true, schedule };
};

module.exports = { getNextAvailableDate, formatDateReadable, bookInstallationSlot };