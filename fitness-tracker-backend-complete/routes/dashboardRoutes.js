const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getWorkoutAnalytics,
  getNutritionAnalytics,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getDashboard);
router.get("/workout-analytics", getWorkoutAnalytics);
router.get("/nutrition-analytics", getNutritionAnalytics);

module.exports = router;
