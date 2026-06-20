// config/db.js
// ─────────────────────────────────────────────
// Connects to MongoDB using the URL from .env
// Uses local MongoDB in development, Atlas in production
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1); // Exit process if DB fails
  }
};

module.exports = connectDB;