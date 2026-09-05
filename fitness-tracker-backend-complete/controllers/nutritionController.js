const NutritionLog = require("../models/NutritionLog");

// @route  POST /api/nutrition
const createNutritionLog = async (req, res) => {
  try {
    const { mealType, foodItems, date } = req.body;

    const log = await NutritionLog.create({
      userId: req.userId,
      mealType,
      foodItems,
      date,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/nutrition  (supports ?mealType=&date=)
const getNutritionLogs = async (req, res) => {
  try {
    const { mealType, date } = req.query;
    const filter = { userId: req.userId };

    if (mealType) filter.mealType = mealType;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const logs = await NutritionLog.find(filter).sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/nutrition/:id
const getNutritionLogById = async (req, res) => {
  try {
    const log = await NutritionLog.findOne({ _id: req.params.id, userId: req.userId });
    if (!log) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/nutrition/:id
const updateNutritionLog = async (req, res) => {
  try {
    const log = await NutritionLog.findOne({ _id: req.params.id, userId: req.userId });
    if (!log) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    Object.assign(log, req.body);
    const updatedLog = await log.save();

    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/nutrition/:id
const deleteNutritionLog = async (req, res) => {
  try {
    const log = await NutritionLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }
    res.status(200).json({ message: "Nutrition log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNutritionLog,
  getNutritionLogs,
  getNutritionLogById,
  updateNutritionLog,
  deleteNutritionLog,
};
