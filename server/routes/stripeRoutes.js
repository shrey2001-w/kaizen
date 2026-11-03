const express = require("express");
const { createCheckout, stripeWebhookHandler } = require("../controllers/stripeController");
const router = express.Router();

// Create Checkout Session
router.post("/create-checkout", createCheckout);

// Stripe webhook (needs the raw body for signature verification)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

module.exports = router;