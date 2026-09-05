const User = require("../models/User");

// @route  GET /api/settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("preferences");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { unit, theme, notificationsEnabled } = req.body;
    if (unit !== undefined) user.preferences.unit = unit;
    if (theme !== undefined) user.preferences.theme = theme;
    if (notificationsEnabled !== undefined)
      user.preferences.notificationsEnabled = notificationsEnabled;

    await user.save();
    res.status(200).json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
