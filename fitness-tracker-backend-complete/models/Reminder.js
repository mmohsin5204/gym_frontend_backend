const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["workout", "meal", "goal"],
      required: true,
    },
    title: {
      type: String,
      required: true, // e.g. "Leg Day Reminder", "Drink water"
    },
    message: {
      type: String,
      default: "",
    },
    scheduledTime: {
      type: Date,
      required: true, // agla waqt jab reminder fire hona chahiye
    },
    repeat: {
      type: String,
      enum: ["none", "daily", "weekly"],
      default: "none",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
