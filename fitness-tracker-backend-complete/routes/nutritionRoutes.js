const express = require("express");
const router = express.Router();
const {
  createNutritionLog,
  getNutritionLogs,
  getNutritionLogById,
  updateNutritionLog,
  deleteNutritionLog,
} = require("../controllers/nutritionController");
const { protect } = require("../middleware/authMiddleware");
const { nutritionValidation } = require("../validators/nutritionValidators");
const validate = require("../middleware/validateMiddleware");

router.use(protect);

router.post("/", nutritionValidation, validate, createNutritionLog);
router.get("/", getNutritionLogs);
router.get("/:id", getNutritionLogById);
router.put("/:id", updateNutritionLog);
router.delete("/:id", deleteNutritionLog);

module.exports = router;
