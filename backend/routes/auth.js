// routes/auth.js
// ─────────────────────────────────────────────
// All authentication routes
// GET  /auth/register  → show register form
// POST /auth/register  → create user
// GET  /auth/login     → show login form
// POST /auth/login     → authenticate user
// GET  /auth/logout    → destroy session
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

module.exports = router;