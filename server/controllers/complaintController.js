const Complaint = require("../models/Complaint");
const AssignedComplaint = require("../models/AssignedComplaint");

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Ordinary)
const createComplaint = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode, comment } = req.body;

    if (!name || !address || !city || !state || !pincode || !comment) {
      return res.status(400).json({
        message: "name, address, city, state, pincode and comment are required",
      });
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      name,
      address,
      city,
      state,
      pincode,
      comment,
      status: "Pending",
    });

    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints - Ordinary sees own, Agent sees assigned, Admin sees all
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    if (req.user.role === "Ordinary") {
      const complaints = await Complaint.find({ userId: req.user._id }).sort({ _id: -1 });
      return res.json(complaints);
    }

    if (req.user.role === "Agent") {
      const assigned = await AssignedComplaint.find({ agentId: req.user._id }).populate("complaintId");
      return res.json(assigned);
    }

    // Admin: sees everything
    const complaints = await Complaint.find({}).populate("userId", "name email phone").sort({ _id: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("userId", "name email phone");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "Ordinary" && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    if (req.user.role === "Agent") {
      const assignment = await AssignedComplaint.findOne({
        agentId: req.user._id,
        complaintId: complaint._id,
      });
      if (!assignment) {
        return res.status(403).json({ message: "Not authorized to view this complaint" });
      }
    }

    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (owner can edit their own pending complaint)
// @route   PUT /api/complaints/:id
// @access  Private (Ordinary - owner only)
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this complaint" });
    }

    const { name, address, city, state, pincode, comment, status } = req.body;

    if (name) complaint.name = name;
    if (address) complaint.address = address;
    if (city) complaint.city = city;
    if (state) complaint.state = state;
    if (pincode) complaint.pincode = pincode;
    if (comment) complaint.comment = comment;

    // Owner is only allowed to cancel or reopen their own complaint
    if (status && ["Cancelled", "Reopened"].includes(status)) {
      complaint.status = status;
    }

    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a complaint to an agent
// @route   POST /api/complaints/:id/assign
// @access  Private (Admin)
const assignComplaint = async (req, res, next) => {
  try {
    const { agentId, agentName } = req.body;

    if (!agentId || !agentName) {
      return res.status(400).json({ message: "agentId and agentName are required" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const assignment = await AssignedComplaint.create({
      agentId,
      complaintId: complaint._id,
      agentName,
      status: "Assigned",
    });

    complaint.status = "Assigned";
    await complaint.save();

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint/assignment status (Agent workflow)
// @route   PUT /api/complaints/:id/status
// @access  Private (Agent, Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "Agent") {
      const assignment = await AssignedComplaint.findOne({
        agentId: req.user._id,
        complaintId: complaint._id,
      });

      if (!assignment) {
        return res.status(403).json({ message: "Not authorized to update this complaint" });
      }

      assignment.status = status;
      await assignment.save();
    }

    complaint.status = status;
    const updated = await complaint.save();

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (owner or Admin)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role !== "Admin" && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this complaint" });
    }

    await AssignedComplaint.deleteMany({ complaintId: complaint._id });
    await complaint.deleteOne();

    res.json({ message: "Complaint removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the assignment (agent + chat thread) linked to a complaint, if any
// @route   GET /api/complaints/:id/assignment
// @access  Private (owner, assigned agent, Admin)
const getAssignmentForComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "Ordinary" && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    const assignment = await AssignedComplaint.findOne({ complaintId: complaint._id }).populate(
      "agentId",
      "name email"
    );

    if (!assignment) {
      return res.status(404).json({ message: "This complaint has not been assigned to an agent yet" });
    }

    if (
      req.user.role === "Agent" &&
      assignment.agentId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view this assignment" });
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getAssignmentForComplaint,
};
