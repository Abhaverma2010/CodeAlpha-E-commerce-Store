// routes/orders.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, cartController.getMyOrders);
router.get("/checkout", isLoggedIn, cartController.getCheckout);
router.post("/place", isLoggedIn, cartController.placeOrder);

module.exports = router;