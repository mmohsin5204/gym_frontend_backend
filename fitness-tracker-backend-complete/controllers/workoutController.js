const Workout = require("../models/Workout");
const { createNotification } = require("./notificationController");

// @route  POST /api/workouts
const createWorkout = async (req, res) => {
  try {
    const { title, category, exercises, date, tags } = req.body;

    const workout = await Workout.create({
      userId: req.userId,
      title,
      category,
      exercises,
      date,
      tags,
    });

    // Workout completion notification (Non-func requirement: Activity Notifications)
    await createNotification(
      req.userId,
      "workout",
      "Workout Logged",
      `You logged "${workout.title}" (${workout.category}) successfully.`
    );

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/workouts  (supports ?category=&search=)
const getWorkouts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { userId: req.userId };

    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const workouts = await Workout.find(filter).sort({ date: -1 });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/workouts/:id
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.userId });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/workouts/:id
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.userId });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    Object.assign(workout, req.body);
    const updatedWorkout = await workout.save();

    res.status(200).json(updatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/workouts/:id
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createWorkout, getWorkouts, getWorkoutById, updateWorkout, deleteWorkout };
