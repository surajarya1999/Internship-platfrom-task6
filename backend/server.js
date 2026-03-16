require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./lib/mongodb");
const routes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/api", routes);
app.get("/", (req, res) => res.json({ status: "✅ InternshipHub API Running" }));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
