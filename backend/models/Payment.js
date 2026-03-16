const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String,
  userEmail: String,
  plan: { type: String, enum: ["bronze", "silver", "gold"], required: true },
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: null },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  invoiceNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
