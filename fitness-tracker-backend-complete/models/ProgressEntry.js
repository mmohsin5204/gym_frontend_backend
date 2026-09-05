const mongoose = require("mongoose");

const progressEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number, // kg ya lbs, user preference ke hisaab se
    },
    bodyMeasurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number,
    },
    performanceMetrics: {
      runTimeMinutes: Number, // e.g. 5km run time
      maxLiftWeight: Number, // e.g. bench press PR
      customNote: String,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgressEntry", progressEntrySchema);
