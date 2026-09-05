const express = require("express");
const router = express.Router();
const {
  exportWorkouts,
  exportNutrition,
  exportProgress,
} = require("../controllers/exportController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/workouts", exportWorkouts);
router.get("/nutrition", exportNutrition);
router.get("/progress", exportProgress);

module.exports = router;
