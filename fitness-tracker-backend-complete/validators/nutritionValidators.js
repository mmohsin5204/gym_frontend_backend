const { body } = require("express-validator");

const nutritionValidation = [
  body("mealType")
    .isIn(["breakfast", "lunch", "dinner", "snack"])
    .withMessage("mealType must be breakfast, lunch, dinner or snack"),
  body("foodItems").isArray({ min: 1 }).withMessage("At least one food item is required"),
  body("foodItems.*.name").trim().notEmpty().withMessage("Food item name is required"),
  body("foodItems.*.quantity").trim().notEmpty().withMessage("Quantity is required"),
  body("foodItems.*.calories").isNumeric().withMessage("Calories must be a number"),
];

module.exports = { nutritionValidation };
