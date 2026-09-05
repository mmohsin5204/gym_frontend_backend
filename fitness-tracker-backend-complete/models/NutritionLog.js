const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: String, // e.g. "200g", "1 cup"
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    macros: {
      protein: { type: Number, default: 0 }, // grams
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const nutritionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foodItems: [foodItemSchema],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NutritionLog", nutritionLogSchema);
