// routes/admin.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const { isLoggedIn, isAdmin } = require("../middleware/auth");

// ── Multer setup for image uploads ────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads")); // save in public/uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// All admin routes: must be logged in AND admin
router.use(isLoggedIn, isAdmin);

// Dashboard
router.get("/", (req, res) => res.render("admin/dashboard", { title: "Admin Dashboard" }));

// Product management
router.get("/products", productController.adminListProducts);
router.get("/products/new", productController.getAddProduct);
router.post("/products", upload.single("image"), productController.postAddProduct);
router.get("/products/:id/edit", productController.getEditProduct);
router.put("/products/:id", upload.single("image"), productController.putEditProduct);
router.delete("/products/:id", productController.deleteProduct);

// Order management
router.get("/orders", cartController.adminGetOrders);
router.post("/orders/:id/status", cartController.updateOrderStatus);

module.exports = router;