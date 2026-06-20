// controllers/productController.js
// ─────────────────────────────────────────────
// Handles all product operations:
// Browse (public), Add/Edit/Delete (admin only)
// ─────────────────────────────────────────────

const Product = require("../models/Product");

// ── PUBLIC ROUTES ─────────────────────────────

// GET /products → Show all products with optional search/filter
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let filter = {};

    // Search by name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category && category !== "All") {
      filter.category = category;
    }

    // Sort options
    let sortOption = {};
    if (sort === "price-low") sortOption.price = 1;
    else if (sort === "price-high") sortOption.price = -1;
    else if (sort === "newest") sortOption.createdAt = -1;
    else sortOption.createdAt = -1; // default: newest first

    const products = await Product.find(filter).sort(sortOption);
    const categories = ["All", "Electronics", "Clothing", "Books", "Home", "Sports", "Other"];

    res.render("products/index", {
      title: "Shop",
      products,
      categories,
      search: search || "",
      selectedCategory: category || "All",
      sort: sort || "newest",
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};

// GET /products/:id → Show single product detail page
exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.session.flash = { type: "error", message: "Product not found" };
      return res.redirect("/products");
    }
    res.render("products/detail", { title: product.name, product });
  } catch (err) {
    res.redirect("/products");
  }
};

// ── ADMIN ROUTES ──────────────────────────────

// GET /admin/products → Admin: list all products
exports.adminListProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render("admin/products", { title: "Manage Products", products });
};

// GET /admin/products/new → Admin: show add product form
exports.getAddProduct = (req, res) => {
  res.render("admin/product-form", {
    title: "Add Product",
    product: null,
    categories: ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"],
  });
};

// POST /admin/products → Admin: save new product
exports.postAddProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    await Product.create({
      name, description,
      price: Number(price),
      category, stock: Number(stock),
      image,
      createdBy: req.session.userId,
    });

    req.session.flash = { type: "success", message: "Product added successfully!" };
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Failed to add product" };
    res.redirect("/admin/products/new");
  }
};

// GET /admin/products/:id/edit → Admin: show edit form
exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin/products");
    res.render("admin/product-form", {
      title: "Edit Product",
      product,
      categories: ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"],
    });
  } catch (err) {
    res.redirect("/admin/products");
  }
};

// PUT /admin/products/:id → Admin: update product
exports.putEditProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const updateData = { name, description, price: Number(price), category, stock: Number(stock) };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    await Product.findByIdAndUpdate(req.params.id, updateData);
    req.session.flash = { type: "success", message: "Product updated!" };
    res.redirect("/admin/products");
  } catch (err) {
    req.session.flash = { type: "error", message: "Update failed" };
    res.redirect("/admin/products");
  }
};

// DELETE /admin/products/:id → Admin: delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.session.flash = { type: "success", message: "Product deleted" };
  } catch (err) {
    req.session.flash = { type: "error", message: "Delete failed" };
  }
  res.redirect("/admin/products");
};