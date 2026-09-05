const { body } = require("express-validator");

const progressValidation = [
  body("weight").optional().isNumeric().withMessage("Weight must be a number"),
  body("bodyMeasurements.chest").optional().isNumeric(),
  body("bodyMeasurements.waist").optional().isNumeric(),
  body("bodyMeasurements.hips").optional().isNumeric(),
  body("bodyMeasurements.arms").optional().isNumeric(),
  body("bodyMeasurements.thighs").optional().isNumeric(),
];

module.exports = { progressValidation };
