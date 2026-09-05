const mongoose = require("mongoose");
const Workout = require("../models/Workout");
const NutritionLog = require("../models/NutritionLog");
const ProgressEntry = require("../models/ProgressEntry");

// @route  GET /api/dashboard
// Recent workouts, nutrition logs, aur latest progress ka overview
const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const recentWorkouts = await Workout.find({ userId }).sort({ date: -1 }).limit(5);
    const recentNutritionLogs = await NutritionLog.find({ userId }).sort({ date: -1 }).limit(5);
    const latestProgress = await ProgressEntry.findOne({ userId }).sort({ date: -1 });

    const totalWorkouts = await Workout.countDocuments({ userId });
    const totalNutritionLogs = await NutritionLog.countDocuments({ userId });

    res.status(200).json({
      recentWorkouts,
      recentNutritionLogs,
      latestProgress,
      stats: {
        totalWorkouts,
        totalNutritionLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/dashboard/workout-analytics
// Workout frequency by category + exercise progress over time
const getWorkoutAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    const categoryBreakdown = await Workout.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const workoutsOverTime = await Workout.find({ userId })
      .sort({ date: 1 })
      .select("title date category exercises");

    res.status(200).json({ categoryBreakdown, workoutsOverTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/dashboard/nutrition-analytics
// Daily calorie totals + macro breakdown
const getNutritionAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    const logs = await NutritionLog.find({ userId }).sort({ date: 1 });

    const dailyTotals = {};
    logs.forEach((log) => {
      const dateKey = log.date.toISOString().split("T")[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      log.foodItems.forEach((item) => {
        dailyTotals[dateKey].calories += item.calories || 0;
        dailyTotals[dateKey].protein += item.macros?.protein || 0;
        dailyTotals[dateKey].carbs += item.macros?.carbs || 0;
        dailyTotals[dateKey].fats += item.macros?.fats || 0;
      });
    });

    res.status(200).json({ dailyTotals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, getWorkoutAnalytics, getNutritionAnalytics };
