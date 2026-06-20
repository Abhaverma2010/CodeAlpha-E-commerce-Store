// routes/products.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductDetail);

module.exports = router;

// ─────────────────────────────────────────────