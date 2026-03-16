const Internship = require("../models/Internship");
const Application = require("../models/Application");
const User = require("../models/User");

const PLAN_LIMITS = { free: 1, bronze: 3, silver: 5, gold: 999999 };

const DEMO_INTERNSHIPS = [
  { title: "Frontend Developer Intern", company: "TechCorp India", role: "Frontend", location: "Remote", duration: "3 months", stipend: "₹10,000/month", description: "Build React-based web apps.", tags: ["React", "JavaScript", "CSS"] },
  { title: "Backend Developer Intern", company: "StartupHub", role: "Backend", location: "Bangalore", duration: "6 months", stipend: "₹15,000/month", description: "Build REST APIs with Node.js.", tags: ["Node.js", "MongoDB", "Express"] },
  { title: "UI/UX Design Intern", company: "DesignStudio", role: "Design", location: "Remote", duration: "2 months", stipend: "₹8,000/month", description: "Design mobile app interfaces.", tags: ["Figma", "UI/UX", "Prototyping"] },
  { title: "Data Science Intern", company: "DataMinds", role: "Data Science", location: "Hyderabad", duration: "4 months", stipend: "₹20,000/month", description: "Build ML models and analyze data.", tags: ["Python", "ML", "Pandas"] },
  { title: "Mobile App Intern", company: "AppWorks", role: "Mobile", location: "Remote", duration: "3 months", stipend: "₹12,000/month", description: "Build cross-platform apps.", tags: ["React Native", "Flutter"] },
  { title: "DevOps Intern", company: "CloudSystems", role: "DevOps", location: "Pune", duration: "6 months", stipend: "₹18,000/month", description: "Manage CI/CD and cloud infra.", tags: ["AWS", "Docker", "CI/CD"] },
  { title: "Full Stack Intern", company: "WebAgency", role: "Full Stack", location: "Remote", duration: "3 months", stipend: "₹14,000/month", description: "Build full stack web applications.", tags: ["React", "Node.js", "MongoDB"] },
  { title: "Cybersecurity Intern", company: "SecureIT", role: "Security", location: "Delhi", duration: "4 months", stipend: "₹16,000/month", description: "Penetration testing and security audits.", tags: ["Security", "Linux", "Networking"] },
];

const seedInternships = async (req, res) => {
  try {
    const count = await Internship.countDocuments();
    if (count === 0) await Internship.insertMany(DEMO_INTERNSHIPS);
    const internships = await Internship.find({});
    res.json({ success: true, internships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getInternships = async (req, res) => {
  try {
    let internships = await Internship.find({}).sort({ createdAt: -1 });
    if (internships.length === 0) {
      await Internship.insertMany(DEMO_INTERNSHIPS);
      internships = await Internship.find({});
    }
    res.json({ success: true, internships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const applyInternship = async (req, res) => {
  try {
    const { userId, internshipId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });

    // Reset monthly count if new month
    const now = new Date();
    const resetAt = new Date(user.applicationsResetAt);
    if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
      user.applicationsUsed = 0;
      user.applicationsResetAt = now;
    }

    const limit = PLAN_LIMITS[user.plan] || 1;
    if (user.applicationsUsed >= limit) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: `Your ${user.plan} plan allows only ${limit === 999999 ? "unlimited" : limit} application(s) per month. Please upgrade!`,
      });
    }

    // Check duplicate
    const existing = await Application.findOne({ userId, internshipTitle: internship.title, company: internship.company });
    if (existing) return res.status(400).json({ success: false, message: "Already applied for this internship!" });

    const application = await Application.create({
      userId, userName: user.name, userEmail: user.email,
      internshipTitle: internship.title, company: internship.company, role: internship.role,
    });

    user.applicationsUsed += 1;
    await user.save();

    const updatedUser = await User.findById(userId);
    res.json({ success: true, application, user: updatedUser, message: `Applied to ${internship.company} successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { seedInternships, getInternships, applyInternship, getUserApplications };
