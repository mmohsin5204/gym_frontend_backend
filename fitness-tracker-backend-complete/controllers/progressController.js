const ProgressEntry = require("../models/ProgressEntry");
const { createNotification } = require("./notificationController");

// @route  POST /api/progress
const createProgressEntry = async (req, res) => {
  try {
    const { weight, bodyMeasurements, performanceMetrics, date } = req.body;

    const entry = await ProgressEntry.create({
      userId: req.userId,
      weight,
      bodyMeasurements,
      performanceMetrics,
      date,
    });

    // Progress / goal achievement notification (Non-func requirement: Activity Notifications)
    await createNotification(
      req.userId,
      "progress",
      "Progress Updated",
      `New progress entry recorded on ${new Date(entry.date).toDateString()}.`
    );

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/progress
const getProgressEntries = async (req, res) => {
  try {
    const entries = await ProgressEntry.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/progress/:id
const getProgressEntryById = async (req, res) => {
  try {
    const entry = await ProgressEntry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: "Progress entry not found" });
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/progress/:id
const updateProgressEntry = async (req, res) => {
  try {
    const entry = await ProgressEntry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    Object.assign(entry, req.body);
    const updatedEntry = await entry.save();

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/progress/:id
const deleteProgressEntry = async (req, res) => {
  try {
    const entry = await ProgressEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: "Progress entry not found" });
    }
    res.status(200).json({ message: "Progress entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProgressEntry,
  getProgressEntries,
  getProgressEntryById,
  updateProgressEntry,
  deleteProgressEntry,
};
