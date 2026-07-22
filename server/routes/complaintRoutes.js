const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getAssignmentForComplaint,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("Ordinary"), createComplaint)
  .get(protect, getComplaints);

router
  .route("/:id")
  .get(protect, getComplaintById)
  .put(protect, authorize("Ordinary"), updateComplaint)
  .delete(protect, deleteComplaint);

router.post("/:id/assign", protect, authorize("Admin"), assignComplaint);
router.put("/:id/status", protect, authorize("Agent", "Admin"), updateComplaintStatus);
router.get("/:id/assignment", protect, getAssignmentForComplaint);

module.exports = router;
