const express = require("express");
const router = express.Router();
const { createFeedback, getMyFeedback } = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const { feedbackValidation } = require("../validators/feedbackValidators");
const validate = require("../middleware/validateMiddleware");

router.use(protect);

router.post("/", feedbackValidation, validate, createFeedback);
router.get("/", getMyFeedback);

module.exports = router;
