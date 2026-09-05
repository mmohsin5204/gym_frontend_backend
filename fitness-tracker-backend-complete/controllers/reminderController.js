const Reminder = require("../models/Reminder");

// @route  POST /api/reminders
const createReminder = async (req, res) => {
  try {
    const { type, title, message, scheduledTime, repeat } = req.body;

    const reminder = await Reminder.create({
      userId: req.userId,
      type,
      title,
      message,
      scheduledTime,
      repeat,
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/reminders  (supports ?type=&isActive=)
const getReminders = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const reminders = await Reminder.find(filter).sort({ scheduledTime: 1 });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/reminders/due  (jo reminders abhi trigger hone chahiye)
const getDueReminders = async (req, res) => {
  try {
    const now = new Date();
    const dueReminders = await Reminder.find({
      userId: req.userId,
      isActive: true,
      scheduledTime: { $lte: now },
    });
    res.status(200).json(dueReminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/reminders/:id
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.userId });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const { type, title, message, scheduledTime, repeat, isActive } = req.body;
    if (type !== undefined) reminder.type = type;
    if (title !== undefined) reminder.title = title;
    if (message !== undefined) reminder.message = message;
    if (scheduledTime !== undefined) reminder.scheduledTime = scheduledTime;
    if (repeat !== undefined) reminder.repeat = repeat;
    if (isActive !== undefined) reminder.isActive = isActive;

    const updatedReminder = await reminder.save();
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/reminders/:id
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReminder,
  getReminders,
  getDueReminders,
  updateReminder,
  deleteReminder,
};
