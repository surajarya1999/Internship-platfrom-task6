const User = require("../models/User");

// Register or get existing user by name+email
const registerOrGetUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: "Name and email are required" });

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({ name, email: email.toLowerCase() });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get user by ID
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerOrGetUser, getUser };
