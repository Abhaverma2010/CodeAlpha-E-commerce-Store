// routes/cart.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isLoggedIn } = require("../middleware/auth");

// All cart routes require login
router.get("/", isLoggedIn, cartController.getCart);
router.post("/add/:productId", isLoggedIn, cartController.addToCart);
router.post("/remove/:productId", isLoggedIn, cartController.removeFromCart);

module.exports = router;