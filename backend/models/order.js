// models/Order.js
// ─────────────────────────────────────────────
// Stores completed orders
// Each order belongs to a user, has multiple items,
// a total price, and a delivery status
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Array of products purchased + quantity + price at time of purchase
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,      // store name at time of purchase (in case product changes)
        price: Number,     // store price at time of purchase
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    // Delivery address
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);