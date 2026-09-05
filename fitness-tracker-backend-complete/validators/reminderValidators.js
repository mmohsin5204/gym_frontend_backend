const { body } = require("express-validator");

const reminderValidation = [
  body("type").isIn(["workout", "meal", "goal"]).withMessage("Type must be workout, meal or goal"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("scheduledTime").isISO8601().withMessage("scheduledTime must be a valid date"),
  body("repeat").optional().isIn(["none", "daily", "weekly"]),
];

module.exports = { reminderValidation };
