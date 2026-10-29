const Stripe = require("stripe");
const { createEmailTemplate, sendEmail } = require("../utils/emailService");
const Booking = require("../models/bookingModel");
const { v4: uuidv4 } = require("uuid");
const { log } = require("node:console");
const mongoose = require('mongoose');
const squareClient = require("../../utils/squareClient");
const { WebhooksHelper } = require("square");
const success = process.env.SUCCESS_URL;
console.log("success------>", success);
const cancel = process.env.CANCEL_URL;
console.log("cancel------>", cancel);

// Save booking to the database with all required and optional fields
const saveBookingToDatabase = async (reservationDetails, paymentStatus) => {
  console.log("db to reservationDetails", reservationDetails);

  try {
    const booking = new Booking({
      name: `${reservationDetails.firstName} ${reservationDetails.lastName}`,
      email: reservationDetails.email,
      bookingId: reservationDetails.bookingId,
      rideOption: reservationDetails.rideOption,
      pickUpDate: reservationDetails.date,
      pickUpTime: reservationDetails.time,
      origins: reservationDetails.pickup,
      destinations: reservationDetails.destination ? reservationDetails.destination : "UNKNOWN DESTINATION",
      numberPassengers: reservationDetails.numberPassengers,
      initialdrop: reservationDetails.initialdrop,
      ReturnLocation: reservationDetails.ReturnLocation,
      FinalDrop: reservationDetails.FinalDrop,
      StopAddress: reservationDetails.StopAddress,
      numberLuggage: reservationDetails.numberLuggage,
      check: reservationDetails.check,
      numberCarSeats: reservationDetails.numberCarSeats,
      paymentStatus,
      addOns: reservationDetails.addOns,
      airline: reservationDetails.airlinename,       // new field
      flightNumber: reservationDetails.flightnumber,   // new field
      phoneNumber: reservationDetails.phone,     // new field
      hourlyService: reservationDetails.hourlyservice, // new field (if needed)
      carChoice: reservationDetails.carChoice,     // new field
      seatOption: reservationDetails?.seatOption ? reservationDetails?.seatOption : "",
    });

    const savedBooking = await booking.save();
    console.log("Booking saved to database:", savedBooking);
    return savedBooking;
  } catch (error) {
    console.error("Error saving booking to database:", error.message);
    throw error;
  }
};

// Controller for creating a Stripe Checkout session
exports.createCheckout = async (req, res) => {
  console.log("Create Square checkout initiated", process.env.SQUARE_LOCATION_ID);

  const { price, reservationDetails, addOns } = req.body;
  const bookingId = uuidv4();

  reservationDetails.bookingId = bookingId;
  reservationDetails.addOns = addOns;

  // Save booking with Pending status
  await saveBookingToDatabase(reservationDetails, "Pending");

  try {
    // 🔹 Base ride line item
    const lineItems = [
      {
        name: "Ride Booking",
        quantity: "1",
        basePriceMoney: {
          amount: Math.round(price * 100),
          currency: "USD",
        },
      },
    ];

    // 🔹 Add-ons
    if (Array.isArray(addOns)) {
      addOns.forEach((addon) => {
        if (addon.price && addon.quantity) {
          lineItems.push({
            name: addon.name,
            quantity: addon.quantity.toString(),
            basePriceMoney: {
              amount: Math.round(addon.price * 100),
              currency: "USD",
            },
          });
        }
      });
    }

    // 🔹 Create payment link
    const response = await squareClient.checkoutApi.createPaymentLink({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        referenceId: bookingId, // ✅ replaces Stripe metadata
        note: `Booking ID: ${bookingId}`,
        lineItems,
      },
      checkoutOptions: {
        redirectUrl: process.env.SUCCESS_URL,
      },
    });

    res.status(200).json({
      url: response.result.paymentLink.url,
      bookingId,
    });
  } catch (error) {
    console.error(
      "Error creating Square checkout:",
      error.result?.errors || error
    );

    res.status(500).json({
      error: "Error creating checkout. Please try again later.",
    });
  }
};

const squareWebhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
console.log("🚀 ~ squareWebhookSignatureKey:", squareWebhookSignatureKey)
exports.squareWebhookHandler = async (req, res) => {
  console.log("Square webhook received.");

  try {
    // Parse raw body
    const rawBody = req.rawBody || JSON.stringify(req.body);
    console.log("Raw body received:", rawBody);

    const event = JSON.parse(rawBody);
    console.log("Parsed event:", event.type);

    // Bypass or verify signature
    const signature = req.headers["x-square-signature"];
    if (process.env.BYPASS_SQUARE_SIGNATURE === "true") {
      console.log("Bypass Square signature verification enabled");
    } else {
      const url = process.env.SQUARE_WEBHOOK_URL;
      const hash = require("crypto")
        .createHmac("sha256", process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)
        .update(url + rawBody)
        .digest("base64");

      if (hash !== signature) {
        console.error("Invalid Square webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
      console.log("Webhook signature verified ✅");
    }

    // Only process payment.updated events
    if (event.type !== "payment.updated") {
      console.log("Unhandled event type:", event.type);
      return res.status(200).json({ received: true });
    }

    const payment = event?.data?.object?.payment;
    if (!payment) {
      console.error("No payment object in webhook payload");
      return res.status(400).json({ error: "No payment object" });
    }

    console.log("Payment received:", payment);

    if (payment.status !== "COMPLETED") {
      console.log("Payment not completed yet:", payment.status);
      return res.status(200).json({ received: true });
    }

    // Safely read amount
    const amountCents = payment.amount_money?.amount || payment.total_money?.amount;
    if (!amountCents) {
      console.error("Payment amount missing in webhook payload");
      return res.status(400).json({ error: "Payment amount missing" });
    }
    const amount = (amountCents / 100).toFixed(2);
    console.log("Payment amount:", amount);

    // Fetch bookingId from order
    const orderId = payment.order_id;
    if (!orderId) {
      console.error("Payment has no order_id");
      return res.status(400).json({ error: "Missing order_id in payment" });
    }

    const { ordersApi } = squareClient;
    const orderResponse = await ordersApi.retrieveOrder(orderId);
    const bookingId = orderResponse.result.order.referenceId;
    if (!bookingId) {
      console.error("No bookingId found in order referenceId.");
      return res.status(400).json({ error: "Missing bookingId in order" });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    let booking = await Booking.findOne({ bookingId }).exec();
    if (!booking) {
      console.error("No booking found with bookingId:", bookingId);
      return res.status(404).json({ error: "Booking not found" });
    }

    const paymentEnvironment = process.env.NODE_ENV === "production" ? "Production" : "Test";

    // Update booking
    booking = await Booking.findOneAndUpdate(
      { bookingId },
      {
        paymentStatus: "Completed",
        paymentIntentId: payment.id,
        amount,
        paymentEnvironment,
      },
      { new: true }
    );

    console.log("Booking updated with payment info:", booking);

    // Add-ons HTML
    let addOnsHtml = "";
    if (booking.addOns && booking.addOns.length > 0) {
      addOnsHtml = `
        <p><b>Add-Ons:</b></p>
        <ul>
          ${booking.addOns
          .map((addon) => {
            const optionText = addon.selectedOption ? `, Option: ${addon.selectedOption}` : "";
            const customText = addon.customNote ? `, Note: ${addon.customNote}` : "";
            const total = addon.price && addon.quantity ? (addon.price * addon.quantity).toFixed(2) : "0.00";
            return `<li>${addon.name}${optionText}${customText} - Quantity: ${addon.quantity} - Total: $${total}</li>`;
          })
          .join("")}
        </ul>`;
    }

    const formattedStops = Array.isArray(booking.StopAddress)
      ? booking.StopAddress.join(", ")
      : booking.StopAddress || "";

    const emailParams = {
      projectName: "KAIZEN TRANSPORTATION",
      name: booking.name,
      bookingId: booking.bookingId,
      rideOption: booking.rideOption,
      pickUpDate: booking.pickUpDate,
      pickUpTime: booking.pickUpTime,
      StopAddress: formattedStops,
      origins: booking.origins,
      destinations: booking.destinations !== "UNKNOWN DESTINATION" ? booking.destinations : "",
      numberPassengers: booking.numberPassengers,
      numberLuggage: booking.numberLuggage,
      numberCarSeats: booking.numberCarSeats,
      carChoice: booking.carChoice || "",
      check: booking.check || "",
      hourlyService: booking.hourlyService || "",
      airline: booking.airline || "",
      flightNumber: booking.flightNumber || "",
      email: booking.email,
      phone: booking.phoneNumber,
      paymentStatus: "Completed",
      paymentIntentId: payment.id || "",
      amount,
      addOns: addOnsHtml,
      seatOption: booking.seatOption || "",
    };

    // Send email
    await sendEmail({ email: booking.email, params: emailParams });
    console.log(`Confirmation email sent to ${booking.email}`);

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Square webhook processing error:", err);
    return res.status(400).json({ error: "Webhook Error" });
  }
};

