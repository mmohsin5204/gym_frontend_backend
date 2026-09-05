const express = require("express");
const router = express.Router();
const {
  createReminder,
  getReminders,
  getDueReminders,
  updateReminder,
  deleteReminder,
} = require("../controllers/reminderController");
const { protect } = require("../middleware/authMiddleware");
const { reminderValidation } = require("../validators/reminderValidators");
const validate = require("../middleware/validateMiddleware");

router.use(protect);

router.post("/", reminderValidation, validate, createReminder);
router.get("/", getReminders);
router.get("/due", getDueReminders);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

module.exports = router;
