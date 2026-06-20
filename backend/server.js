// server.js
// ─────────────────────────────────────────────
// ENTRY POINT — Run this to start the server
// Command: npm run dev (development)
//          npm start  (production)
// ─────────────────────────────────────────────

require("dotenv").config(); // Load .env variables FIRST
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const path = require("path");
const connectDB = require("./config/db");
const { setLocals } = require("./middleware/auth");

const app = express();

// ── Connect to MongoDB ────────────────────────
connectDB();

// ── View Engine (EJS) ────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// ── Static Files ──────────────────────────────
// Serve CSS, JS, images from the public folder
app.use(express.static(path.join(__dirname, "public")));
// Also make uploads accessible
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ── Middleware ────────────────────────────────
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json());                          // Parse JSON bodies
app.use(methodOverride("_method"));              // Allow PUT/DELETE in HTML forms

// ── Sessions ──────────────────────────────────
// Sessions are stored in MongoDB so they survive server restarts
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-this",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: {
      httpOnly: true,
      // secure: true,  // Uncomment this when deployed to HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ── Global Template Variables ─────────────────
// Makes currentUser & flash available in ALL views
app.use(setLocals);

// ── Routes ────────────────────────────────────
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/product"));
app.use("/cart", require("./routes/cart"));
app.use("/orders", require("./routes/order"));
app.use("/admin", require("./routes/admin"));

// Home page → redirect to products
app.get("/", async (req, res) => {
  const Product = require("./models/Product");
  try {
    const featuredProducts = await Product.find().limit(6).sort({ createdAt: -1 });
    res.render("home", { title: "ShopEase - Your Online Store", featuredProducts });
  } catch (err) {
    res.render("home", { title: "ShopEase", featuredProducts: [] });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", { title: "404 Not Found", message: "Page not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Error",
    message: err.message || "Something went wrong",
  });
});

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});