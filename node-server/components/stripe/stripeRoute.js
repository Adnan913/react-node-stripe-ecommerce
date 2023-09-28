const express = require('express');
const router = express.Router();
const {createPaymentIntent, getConfig} = require('./stripeController');

router.get("/config", getConfig);
router.post("/create-payment-intent", createPaymentIntent);

module.exports = router;