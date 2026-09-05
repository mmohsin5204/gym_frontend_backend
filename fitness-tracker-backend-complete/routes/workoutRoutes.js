const express = require("express");
const router = express.Router();
const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");
const { workoutValidation } = require("../validators/workoutValidators");
const validate = require("../middleware/validateMiddleware");

router.use(protect); // in-neeche saari routes protected hain

router.post("/", workoutValidation, validate, createWorkout);
router.get("/", getWorkouts);
router.get("/:id", getWorkoutById);
router.put("/:id", updateWorkout);
router.delete("/:id", deleteWorkout);

module.exports = router;
