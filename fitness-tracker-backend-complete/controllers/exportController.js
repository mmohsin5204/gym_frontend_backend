const PDFDocument = require("pdfkit");
const Workout = require("../models/Workout");
const NutritionLog = require("../models/NutritionLog");
const ProgressEntry = require("../models/ProgressEntry");
const { jsonToCsv } = require("../utils/csvHelper");

// @route  GET /api/export/workouts?format=csv|pdf
const exportWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId }).sort({ date: -1 });
    const format = req.query.format || "csv";

    if (format === "pdf") {
      return streamPdfReport(res, "Workout Report", workouts, (doc, w) => {
        doc.fontSize(12).text(`${w.title} (${w.category}) - ${w.date.toDateString()}`, {
          underline: true,
        });
        w.exercises.forEach((ex) => {
          doc
            .fontSize(10)
            .text(`  • ${ex.name}: ${ex.sets} sets x ${ex.reps} reps @ ${ex.weight || 0}`);
        });
        doc.moveDown(0.5);
      });
    }

    const csv = jsonToCsv(workouts, [
      { label: "Title", value: (w) => w.title },
      { label: "Category", value: (w) => w.category },
      { label: "Date", value: (w) => w.date.toISOString().split("T")[0] },
      { label: "Exercises", value: (w) => w.exercises.map((e) => e.name).join("; ") },
      { label: "Total Exercises", value: (w) => w.exercises.length },
    ]);

    res.header("Content-Type", "text/csv");
    res.attachment("workouts.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/export/nutrition?format=csv|pdf
const exportNutrition = async (req, res) => {
  try {
    const logs = await NutritionLog.find({ userId: req.userId }).sort({ date: -1 });
    const format = req.query.format || "csv";

    if (format === "pdf") {
      return streamPdfReport(res, "Nutrition Report", logs, (doc, log) => {
        const totalCalories = log.foodItems.reduce((sum, f) => sum + (f.calories || 0), 0);
        doc
          .fontSize(12)
          .text(`${log.mealType.toUpperCase()} - ${log.date.toDateString()} (${totalCalories} kcal)`, {
            underline: true,
          });
        log.foodItems.forEach((item) => {
          doc.fontSize(10).text(`  • ${item.name} (${item.quantity}) - ${item.calories} kcal`);
        });
        doc.moveDown(0.5);
      });
    }

    const csv = jsonToCsv(logs, [
      { label: "Meal Type", value: (l) => l.mealType },
      { label: "Date", value: (l) => l.date.toISOString().split("T")[0] },
      {
        label: "Total Calories",
        value: (l) => l.foodItems.reduce((sum, f) => sum + (f.calories || 0), 0),
      },
      { label: "Food Items", value: (l) => l.foodItems.map((f) => f.name).join("; ") },
    ]);

    res.header("Content-Type", "text/csv");
    res.attachment("nutrition.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/export/progress?format=csv|pdf
const exportProgress = async (req, res) => {
  try {
    const entries = await ProgressEntry.find({ userId: req.userId }).sort({ date: -1 });
    const format = req.query.format || "csv";

    if (format === "pdf") {
      return streamPdfReport(res, "Progress Report", entries, (doc, e) => {
        doc.fontSize(12).text(`${e.date.toDateString()}`, { underline: true });
        if (e.weight) doc.fontSize(10).text(`  Weight: ${e.weight}`);
        if (e.bodyMeasurements) {
          const m = e.bodyMeasurements;
          doc
            .fontSize(10)
            .text(
              `  Measurements - Chest: ${m.chest || "-"}, Waist: ${m.waist || "-"}, Hips: ${
                m.hips || "-"
              }, Arms: ${m.arms || "-"}, Thighs: ${m.thighs || "-"}`
            );
        }
        doc.moveDown(0.5);
      });
    }

    const csv = jsonToCsv(entries, [
      { label: "Date", value: (e) => e.date.toISOString().split("T")[0] },
      { label: "Weight", value: (e) => e.weight || "" },
      { label: "Chest", value: (e) => e.bodyMeasurements?.chest || "" },
      { label: "Waist", value: (e) => e.bodyMeasurements?.waist || "" },
      { label: "Hips", value: (e) => e.bodyMeasurements?.hips || "" },
      { label: "Arms", value: (e) => e.bodyMeasurements?.arms || "" },
      { label: "Thighs", value: (e) => e.bodyMeasurements?.thighs || "" },
    ]);

    res.header("Content-Type", "text/csv");
    res.attachment("progress.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper - PDF stream banata hai aur response mein pipe karta hai
const streamPdfReport = (res, title, items, renderItem) => {
  const doc = new PDFDocument({ margin: 40 });
  res.header("Content-Type", "application/pdf");
  res.attachment(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: "center" });
  doc.moveDown();

  if (items.length === 0) {
    doc.fontSize(12).text("No records found.");
  } else {
    items.forEach((item) => renderItem(doc, item));
  }

  doc.end();
};

module.exports = { exportWorkouts, exportNutrition, exportProgress };
