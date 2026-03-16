const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { sendInvoiceEmail } = require("../lib/email");

const PLANS = {
  bronze: { name: "Bronze Plan", amount: 100,  limit: 3 },
  silver: { name: "Silver Plan", amount: 300,  limit: 5 },
  gold:   { name: "Gold Plan",   amount: 1000, limit: 999999 },
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateInvoice = () => {
  const d = new Date();
  const yymm = `${d.getFullYear().toString().slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}`;
  return `INV-${yymm}-${Math.floor(Math.random()*9000+1000)}`;
};

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: "Invalid plan selected" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const planInfo = PLANS[plan];

    const order = await razorpay.orders.create({
      amount: planInfo.amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    const invoiceNumber = generateInvoice();

    const payment = await Payment.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      plan,
      amount: planInfo.amount,
      razorpayOrderId: order.id,
      invoiceNumber,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: planInfo.amount * 100,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      userName: user.name,
      userEmail: user.email,
      paymentDbId: payment._id,
    });
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify payment + activate plan + send invoice
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDbId } = req.body;

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentDbId,
      { razorpayPaymentId: razorpay_payment_id, status: "paid" },
      { new: true }
    );

    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    // Activate plan on user
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const user = await User.findByIdAndUpdate(
      payment.userId,
      { plan: payment.plan, planExpiresAt: expiresAt, applicationsUsed: 0, applicationsResetAt: new Date() },
      { new: true }
    );

    // Send invoice email
    try {
      await sendInvoiceEmail({
        name: payment.userName,
        email: payment.userEmail,
        plan: payment.plan,
        amount: payment.amount,
        invoiceNumber: payment.invoiceNumber,
        paymentId: razorpay_payment_id,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.json({
      success: true,
      user,
      message: `🎉 ${PLANS[payment.plan].name} activated! Invoice sent to ${payment.userEmail}`,
    });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Payment history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId, status: "paid" }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
