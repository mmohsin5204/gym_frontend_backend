const User = require("../models/User");

// @route  GET /api/users/search?q=
// Sirf public info return karta hai (name, profilePicture) - password/email hidden
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query 'q' is required" });
    }

    const users = await User.find({
      _id: { $ne: req.userId }, // apna profile results mein nahi chahiye
      name: { $regex: q, $options: "i" },
    })
      .select("name profilePicture")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchUsers };
