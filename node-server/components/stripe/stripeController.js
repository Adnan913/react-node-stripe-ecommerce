require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

const createPaymentIntent = async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "USD",
        amount: 240,
        automatic_payment_methods: { enabled: true },
      });
  
      // Send publishable key and PaymentIntent details to client
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (e) {
      return res.status(400).send({
        error: {
          message: e.message,
        },
      });
    }
  }
  
const getConfig = (req, res) => {
      res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    }
module.exports = {createPaymentIntent, getConfig};