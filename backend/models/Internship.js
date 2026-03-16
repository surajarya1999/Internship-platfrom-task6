const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: "Remote" },
  duration: { type: String, default: "3 months" },
  stipend: { type: String, default: "Unpaid" },
  description: String,
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model("Internship", internshipSchema);
