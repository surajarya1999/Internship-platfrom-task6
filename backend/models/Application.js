const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String,
  userEmail: String,
  internshipTitle: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ["applied", "reviewing", "accepted", "rejected"], default: "applied" },
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
