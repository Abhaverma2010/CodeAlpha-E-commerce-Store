// controllers/authController.js
// ─────────────────────────────────────────────
// Handles user registration, login, and logout
// Sessions store user info (no JWT needed for EJS apps)
// ─────────────────────────────────────────────

const User = require("../models/User");

// ── REGISTER ──────────────────────────────────

// GET /auth/register → Show registration form
exports.getRegister = (req, res) => {
  res.render("auth/register", { title: "Create Account" });
};

// POST /auth/register → Create new user
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Basic validation
    if (password !== confirmPassword) {
      req.session.flash = { type: "error", message: "Passwords do not match" };
      return res.redirect("/auth/register");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.session.flash = { type: "error", message: "Email already registered" };
      return res.redirect("/auth/register");
    }

    // Create user (password gets hashed automatically via pre-save hook)
    const user = await User.create({ name, email, password });

    // Auto-login after registration
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    req.session.flash = { type: "success", message: `Welcome, ${user.name}! 🎉` };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Registration failed. Try again." };
    res.redirect("/auth/register");
  }
};

// ── LOGIN ──────────────────────────────────────

// GET /auth/login → Show login form
exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "Login" });
};

// POST /auth/login → Verify credentials
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.session.flash = { type: "error", message: "Invalid email or password" };
      return res.redirect("/auth/login");
    }

    // Compare password using bcrypt method we defined on the model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.session.flash = { type: "error", message: "Invalid email or password" };
      return res.redirect("/auth/login");
    }

    // Save user info in session
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    req.session.flash = { type: "success", message: `Welcome back, ${user.name}!` };

    // Redirect to where they were going, or home
    const returnTo = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Login failed. Try again." };
    res.redirect("/auth/login");
  }
};

// ── LOGOUT ─────────────────────────────────────

// GET /auth/logout → Destroy session
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/auth/login");
  });
};