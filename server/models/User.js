const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: 'Name is required' },
  email: { type: String, required: 'Email is required' },
  password: { type: String, required: 'Password is required' },
  phone: { type: Number, required: 'Phone is required' },
  role: { type: String,
      enum: ["Admin", "Agent", "Ordinary"],
      default: "Ordinary",},
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
