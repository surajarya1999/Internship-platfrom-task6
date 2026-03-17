// Payments only allowed 10:00 AM - 11:00 AM IST
const paymentTimeRestriction = (req, res, next) => {
  next(); // Temporarily sab allow karo
};

module.exports = { paymentTimeRestriction };
