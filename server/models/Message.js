const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  name: { type: String, required: 'Name is required' },
  message: { type: String, required: 'Message is required' },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "AssignedComplaint" }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
