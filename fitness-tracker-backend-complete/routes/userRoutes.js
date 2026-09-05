const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/search", searchUsers);

module.exports = router;
