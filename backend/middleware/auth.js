// middleware/auth.js
// ─────────────────────────────────────────────
// Middleware functions to protect routes
// isLoggedIn  → any authenticated user
// isAdmin     → only admin users
// ─────────────────────────────────────────────

// ✅ Checks if user is logged in via session
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next(); // User is authenticated, proceed
  }
  req.session.returnTo = req.originalUrl; // Remember where they were going
  req.session.flash = { type: "error", message: "Please login to continue" };
  res.redirect("/auth/login");
};

// ✅ Checks if logged-in user has admin role
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === "admin") {
    return next();
  }
  req.session.flash = { type: "error", message: "Admin access required" };
  res.redirect("/");
};

// ✅ Makes user info available in ALL EJS views automatically
const setLocals = (req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? {
        id: req.session.userId,
        name: req.session.userName,
        role: req.session.userRole,
      }
    : null;

  // Flash messages (success/error notifications)
  res.locals.flash = req.session.flash || null;
  delete req.session.flash; // Clear after reading

  next();
};

module.exports = { isLoggedIn, isAdmin, setLocals };