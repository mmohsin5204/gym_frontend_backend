const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
    },
    reps: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number, // kg ya lbs, user preference ke hisaab se
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true, // e.g. "Push Day", "Leg Day"
    },
    category: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "other"],
      required: true,
    },
    exercises: [exerciseSchema],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    tags: [String], // easy organization ke liye
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
