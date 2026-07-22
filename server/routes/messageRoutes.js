const express = require("express");
const router = express.Router();
const { sendMessage, getMessagesByComplaint } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.get("/:complaintId", protect, getMessagesByComplaint);

module.exports = router;
