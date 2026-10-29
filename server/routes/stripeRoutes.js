const express = require('express');
// const { createCheckout } = require('../controllers/stripeController');
const { createCheckout, squareWebhookHandler } = require('../controllers/stripeController');
const router = express.Router();

// Create Checkout Session
router.post('/create-checkout', createCheckout);
router.post('/webhook', express.raw({ type: 'application/json' }), squareWebhookHandler);
module.exports = router;
