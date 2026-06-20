// controllers/cartController.js
// ─────────────────────────────────────────────
// Cart: add/remove items, view cart
// Order: place order, view order history
// ─────────────────────────────────────────────

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ── CART ──────────────────────────────────────

// GET /cart → Show cart page
exports.getCart = async (req, res) => {
  try {
    // Populate product details inside the user's cart array
    const user = await User.findById(req.session.userId).populate("cart.product");

    // Calculate total
    let total = 0;
    user.cart.forEach((item) => {
      if (item.product) total += item.product.price * item.quantity;
    });

    res.render("cart/index", { title: "My Cart", cart: user.cart, total });
  } catch (err) {
    res.redirect("/products");
  }
};

// POST /cart/add/:productId → Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const productId = req.params.productId;

    // Check if product already in cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1; // Increase quantity
    } else {
      user.cart.push({ product: productId, quantity: 1 }); // Add new item
    }

    await user.save();
    req.session.flash = { type: "success", message: "Added to cart!" };
    res.redirect("/products");
  } catch (err) {
    req.session.flash = { type: "error", message: "Could not add to cart" };
    res.redirect("/products");
  }
};

// POST /cart/remove/:productId → Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    // Filter out the item with matching product ID
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await user.save();
    req.session.flash = { type: "success", message: "Item removed" };
    res.redirect("/cart");
  } catch (err) {
    res.redirect("/cart");
  }
};

// ── ORDERS ────────────────────────────────────

// GET /orders → Show all orders for current user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.userId })
      .sort({ createdAt: -1 });
    res.render("orders/my-orders", { title: "My Orders", orders });
  } catch (err) {
    res.redirect("/");
  }
};

// GET /orders/checkout → Show checkout form
exports.getCheckout = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate("cart.product");
    if (!user.cart.length) {
      req.session.flash = { type: "error", message: "Your cart is empty!" };
      return res.redirect("/cart");
    }

    let total = 0;
    user.cart.forEach((item) => {
      if (item.product) total += item.product.price * item.quantity;
    });

    res.render("orders/checkout", { title: "Checkout", cart: user.cart, total });
  } catch (err) {
    res.redirect("/cart");
  }
};

// POST /orders/place → Place order (move cart → order)
exports.placeOrder = async (req, res) => {
  try {
    const { street, city, state, pincode, paymentMethod } = req.body;

    const user = await User.findById(req.session.userId).populate("cart.product");

    if (!user.cart.length) {
      req.session.flash = { type: "error", message: "Cart is empty!" };
      return res.redirect("/cart");
    }

    // Build order items array (snapshot prices at time of purchase)
    const items = user.cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create the order
    const order = await Order.create({
      user: req.session.userId,
      items,
      totalAmount,
      shippingAddress: { street, city, state, pincode },
      paymentMethod,
    });

    // Reduce stock for each product
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the cart
    user.cart = [];
    await user.save();

    req.session.flash = {
      type: "success",
      message: `Order #${order._id.toString().slice(-6).toUpperCase()} placed successfully! 🎉`,
    };
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Order failed. Try again." };
    res.redirect("/cart");
  }
};

// GET /admin/orders → Admin: see all orders
exports.adminGetOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.render("admin/orders", { title: "All Orders", orders });
  } catch (err) {
    res.redirect("/admin");
  }
};

// POST /admin/orders/:id/status → Admin: update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    req.session.flash = { type: "success", message: "Order status updated!" };
  } catch (err) {
    req.session.flash = { type: "error", message: "Update failed" };
  }
  res.redirect("/admin/orders");
};