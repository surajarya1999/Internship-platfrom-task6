// Payments only allowed 10:00 AM - 11:00 AM IST
const paymentTimeRestriction = (req, res, next) => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const total = hours * 60 + minutes;

  const istStr = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")} IST`;

  if (total < 600 || total >= 660) {
    return res.status(403).json({
      success: false,
      blocked: true,
      currentTime: istStr,
      message: `⏰ Payments allowed only between 10:00 AM – 11:00 AM IST. Current time: ${istStr}`,
    });
  }
  next();
};

module.exports = { paymentTimeRestriction };
