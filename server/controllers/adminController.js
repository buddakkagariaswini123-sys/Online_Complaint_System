const User = require("../models/User");
const Complaint = require("../models/Complaint");
const AssignedComplaint = require("../models/AssignedComplaint");

// @desc    Get all ordinary users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "Ordinary" }).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all agents
// @route   GET /api/admin/agents
// @access  Private (Admin)
const getAllAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: "Agent" }).select("-password");
    res.json(agents);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Admin oversight)
// @route   GET /api/admin/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({}).populate("userId", "name email phone").sort({ _id: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaint assignments
// @route   GET /api/admin/assignments
// @access  Private (Admin)
const getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await AssignedComplaint.find({})
      .populate("agentId", "name email")
      .populate("complaintId");
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAgents, totalComplaints, pending, assigned, resolved] = await Promise.all([
      User.countDocuments({ role: "Ordinary" }),
      User.countDocuments({ role: "Agent" }),
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Assigned" }),
      Complaint.countDocuments({ status: "Resolved" }),
    ]);

    res.json({ totalUsers, totalAgents, totalComplaints, pending, assigned, resolved });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllAgents,
  getAllComplaints,
  getAllAssignments,
  getDashboardStats,
};
