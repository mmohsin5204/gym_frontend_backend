const { body } = require("express-validator");

const feedbackValidation = [
  body("type").optional().isIn(["bug", "feedback", "support"]),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

module.exports = { feedbackValidation };
