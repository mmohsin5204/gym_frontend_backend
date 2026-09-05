const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // yeh hashed store hoga (bcrypt se)
    },
    profilePicture: {
      type: String,
      default: "",
    },
    preferences: {
      unit: {
        type: String,
        enum: ["metric", "imperial"], // kg/cm vs lbs/inches
        default: "metric",
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
