const Feedback = require("../models/Feedback");

// @route  POST /api/feedback
const createFeedback = async (req, res) => {
  try {
    const { type, subject, message } = req.body;

    const feedback = await Feedback.create({
      userId: req.userId,
      type,
      subject,
      message,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/feedback  (user apni submitted feedback dekh sakta hai)
const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createFeedback, getMyFeedback };
