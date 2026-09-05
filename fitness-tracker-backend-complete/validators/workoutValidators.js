const { body } = require("express-validator");

const workoutValidation = [
  body("title").trim().notEmpty().withMessage("Workout title is required"),
  body("category")
    .isIn(["strength", "cardio", "flexibility", "other"])
    .withMessage("Category must be strength, cardio, flexibility or other"),
  body("exercises").isArray({ min: 1 }).withMessage("At least one exercise is required"),
  body("exercises.*.name").trim().notEmpty().withMessage("Exercise name is required"),
  body("exercises.*.sets").isNumeric().withMessage("Sets must be a number"),
  body("exercises.*.reps").isNumeric().withMessage("Reps must be a number"),
];

module.exports = { workoutValidation };
