const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

// Security headers (Non-func requirement: Security)
app.use(helmet());

// Request logging (Non-func requirement: Logging and Monitoring)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic rate limiting (Non-func requirement: Performance / abuse prevention)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // har IP 15 min mein max 300 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Fitness Tracker API is running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workouts", require("./routes/workoutRoutes"));
app.use("/api/nutrition", require("./routes/nutritionRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reminders", require("./routes/reminderRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
