const express = require("express");
const router = express.Router();
const { registerOrGetUser, getUser } = require("../controllers/userController");
const { createOrder, verifyPayment, getPaymentHistory } = require("../controllers/paymentController");
const { getInternships, applyInternship, getUserApplications } = require("../controllers/internshipController");
const { paymentTimeRestriction } = require("../middleware/timeRestriction");

// User
router.post("/user/register", registerOrGetUser);
router.get("/user/:id", getUser);

// Payments (10-11 AM IST only)
router.post("/payments/create-order", paymentTimeRestriction, createOrder);
router.post("/payments/verify", verifyPayment);
router.get("/payments/history/:userId", getPaymentHistory);

// Internships
router.get("/internships", getInternships);
router.post("/internships/apply", applyInternship);
router.get("/internships/applications/:userId", getUserApplications);

module.exports = router;
