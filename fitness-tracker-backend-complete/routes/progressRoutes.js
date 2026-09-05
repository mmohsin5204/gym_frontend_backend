const express = require("express");
const router = express.Router();
const {
  createProgressEntry,
  getProgressEntries,
  getProgressEntryById,
  updateProgressEntry,
  deleteProgressEntry,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");
const { progressValidation } = require("../validators/progressValidators");
const validate = require("../middleware/validateMiddleware");

router.use(protect);

router.post("/", progressValidation, validate, createProgressEntry);
router.get("/", getProgressEntries);
router.get("/:id", getProgressEntryById);
router.put("/:id", updateProgressEntry);
router.delete("/:id", deleteProgressEntry);

module.exports = router;
