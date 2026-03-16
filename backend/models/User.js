const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
  planExpiresAt: { type: Date, default: null },
  applicationsUsed: { type: Number, default: 0 },
  applicationsResetAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
