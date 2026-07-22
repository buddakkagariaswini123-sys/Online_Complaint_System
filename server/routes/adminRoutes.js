const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllAgents,
  getAllComplaints,
  getAllAssignments,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("Admin"));

router.get("/users", getAllUsers);
router.get("/agents", getAllAgents);
router.get("/complaints", getAllComplaints);
router.get("/assignments", getAllAssignments);
router.get("/stats", getDashboardStats);

module.exports = router;
