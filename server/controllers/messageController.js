const Message = require("../models/Message");
const AssignedComplaint = require("../models/AssignedComplaint");
const Complaint = require("../models/Complaint");

// @desc    Send a message tied to an assigned complaint (chat window)
// @route   POST /api/messages
// @access  Private (Ordinary - complaint owner, Agent - assigned agent, Admin)
const sendMessage = async (req, res, next) => {
  try {
    const { complaintId, message } = req.body; // complaintId = AssignedComplaint _id

    if (!complaintId || !message) {
      return res.status(400).json({ message: "complaintId and message are required" });
    }

    const assignment = await AssignedComplaint.findById(complaintId).populate("complaintId");
    if (!assignment) {
      return res.status(404).json({ message: "Assigned complaint not found" });
    }

    const isAssignedAgent = assignment.agentId.toString() === req.user._id.toString();
    const isOwner = assignment.complaintId.userId.toString() === req.user._id.toString();

    if (!isAssignedAgent && !isOwner && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to message on this complaint" });
    }

    const newMessage = await Message.create({
      name: req.user.name,
      message,
      complaintId,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages for an assigned complaint
// @route   GET /api/messages/:complaintId
// @access  Private (owner, assigned agent, Admin)
const getMessagesByComplaint = async (req, res, next) => {
  try {
    const assignment = await AssignedComplaint.findById(req.params.complaintId).populate("complaintId");
    if (!assignment) {
      return res.status(404).json({ message: "Assigned complaint not found" });
    }

    const isAssignedAgent = assignment.agentId.toString() === req.user._id.toString();
    const isOwner = assignment.complaintId.userId.toString() === req.user._id.toString();

    if (!isAssignedAgent && !isOwner && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ complaintId: req.params.complaintId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessagesByComplaint,
};
