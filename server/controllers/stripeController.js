const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
const { sendEmail, escapeHtml } = require("../utils/emailService");
const Booking = require("../models/bookingModel");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CURRENCY = (process.env.PAYMENT_CURRENCY || "usd").toLowerCase();

// Stripe amounts are in the smallest currency unit (cents / paise)
const toMinorUnits = (amount) => Math.round(Number(amount) * 100);

// Save booking to the database
const saveBookingToDatabase = async (reservationDetails, paymentStatus, extras = {}) => {
  const booking = new Booking({
    name: `${reservationDetails.firstName} ${reservationDetails.lastName}`,
    email: reservationDetails.email,
    bookingId: reservationDetails.bookingId,
    rideOption: reservationDetails.rideOption,
    pickUpDate: reservationDetails.date,
    pickUpTime: reservationDetails.time,
    origins: reservationDetails.pickup,
    destinations: reservationDetails.destination || "UNKNOWN DESTINATION",
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
    airline: reservationDetails.airlinename,
    flightNumber: reservationDetails.flightnumber,
    phoneNumber: reservationDetails.phone,
    hourlyService: reservationDetails.hourlyservice,
    carChoice: reservationDetails.carChoice,
    seatOption: reservationDetails?.seatOption || "",
    ...(extras.amount ? { amount: extras.amount } : {}),
  });
  return booking.save();
};

// Builds the params object used by the Brevo email template
const buildEmailParams = (booking, { paymentStatus, paymentIntentId = "", amount }) => {
  const formattedStops = Array.isArray(booking.StopAddress)
    ? booking.StopAddress.join(", ")
    : booking.StopAddress || "";

  return {
    projectName: "KAIZEN TRANSPORTATION",
    name: booking.name,
    bookingId: booking.bookingId,
    rideOption: booking.rideOption,
    pickUpDate: booking.pickUpDate,
    pickUpTime: booking.pickUpTime,
    StopAddress: formattedStops,
    origins: booking.origins,
    destinations:
      booking.destinations !== "UNKNOWN DESTINATION" ? booking.destinations : "",
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
    paymentStatus,
    paymentIntentId,
    amount,
    addOns: buildAddOnsHtml(booking.addOns),
    seatOption: booking.seatOption || "",
  };
};

// POST /create-checkout
// body.paymentMethod: "stripe" (default) | "cash"
exports.createCheckout = async (req, res) => {
  const { price, reservationDetails, addOns, paymentMethod = "stripe" } = req.body || {};

  if (!price || Number(price) <= 0 || !reservationDetails) {
    return res.status(400).json({ error: "Invalid booking request." });
  }
  if (!["stripe", "cash"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Invalid payment method." });
  }

  const bookingId = uuidv4();
  reservationDetails.bookingId = bookingId;
  reservationDetails.addOns = addOns;

  /* ---------------------------- CASH ---------------------------- */
  if (paymentMethod === "cash") {
    try {
      const amount = Number(price).toFixed(2);
      // Add-ons total (if any) so the email shows the full amount due
      const addOnsTotal = Array.isArray(addOns)
        ? addOns.reduce((sum, a) => sum + Number(a.price || 0) * Number(a.quantity || 0), 0)
        : 0;
      const totalDue = (Number(amount) + addOnsTotal).toFixed(2);

      const booking = await saveBookingToDatabase(reservationDetails, "Cash", {
        amount: totalDue,
      });

      let emailSent = true;
      try {
        await sendEmail({
          email: booking.email,
          params: buildEmailParams(booking, {
            paymentStatus: "Pay by Cash",
            amount: totalDue,
          }),
        });
      } catch (emailErr) {
        // The booking is saved; don't fail the request because of email
        emailSent = false;
        console.error("Cash booking email failed:", emailErr.message);
      }

      return res.status(200).json({
        success: true,
        method: "cash",
        bookingId,
        emailSent,
      });
    } catch (error) {
      console.error("Error creating cash booking:", error.message);
      return res
        .status(500)
        .json({ error: "Could not create your booking. Please try again." });
    }
  }

  /* --------------------------- STRIPE --------------------------- */
  // Validate configuration BEFORE touching the database
  const successUrl = process.env.SUCCESS_URL;
  const cancelUrl = process.env.CANCEL_URL;
  if (!process.env.STRIPE_SECRET_KEY || !successUrl || !cancelUrl) {
    console.error(
      "Missing config: STRIPE_SECRET_KEY, SUCCESS_URL and CANCEL_URL must be set in .env"
    );
    return res.status(500).json({ error: "Payment configuration error." });
  }

  let bookingSaved = false;

  try {
    // Saved as Pending first so the webhook can always find it.
    await saveBookingToDatabase(reservationDetails, "Pending");
    bookingSaved = true;

    const line_items = [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toMinorUnits(price),
          product_data: {
            name: "Ride Booking",
            description: `${reservationDetails.carChoice || "Ride"} • ${
              reservationDetails.date || ""
            } ${reservationDetails.time || ""}`.trim(),
          },
        },
      },
    ];

    if (Array.isArray(addOns)) {
      addOns.forEach((addon) => {
        if (addon.price && addon.quantity) {
          line_items.push({
            quantity: Number(addon.quantity),
            price_data: {
              currency: CURRENCY,
              unit_amount: toMinorUnits(addon.price),
              product_data: { name: addon.name },
            },
          });
        }
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: reservationDetails.email,
      client_reference_id: bookingId,
      metadata: { bookingId },
      payment_intent_data: { metadata: { bookingId } },
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({ url: session.url, bookingId });
  } catch (error) {
    console.error("Error creating Stripe checkout:", error.message);

    // Don't leave an orphan Pending booking if checkout creation failed
    if (bookingSaved) {
      try {
        await Booking.deleteOne({ bookingId, paymentStatus: "Pending" });
      } catch (cleanupErr) {
        console.error("Failed to clean up pending booking:", cleanupErr.message);
      }
    }

    return res
      .status(500)
      .json({ error: "Error creating checkout. Please try again later." });
  }
};

// Builds the add-ons HTML block for the email template
const buildAddOnsHtml = (addOns) => {
  if (!addOns || addOns.length === 0) return "";
  const items = addOns
    .map((addon) => {
      const optionText = addon.selectedOption ? `, Option: ${addon.selectedOption}` : "";
      const customText = addon.customNote ? `, Note: ${addon.customNote}` : "";
      const total =
        addon.price && addon.quantity ? (addon.price * addon.quantity).toFixed(2) : "0.00";
      return `<li>${escapeHtml(addon.name)}${escapeHtml(optionText)}${escapeHtml(customText)} - Quantity: ${escapeHtml(addon.quantity)} - Total: ${total}</li>`;
    })
    .join("");
  return `<p><b>Add-Ons:</b></p><ul>${items}</ul>`;
};

// POST /webhook  (req.body must be the raw Buffer)
exports.stripeWebhookHandler = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Invalid Stripe webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;

      if (session.payment_status !== "paid") {
        return res.status(200).json({ received: true });
      }

      const bookingId = session.metadata?.bookingId || session.client_reference_id;
      if (!bookingId) {
        console.error("No bookingId on session", session.id);
        return res.status(200).json({ received: true });
      }

      const existing = await Booking.findOne({ bookingId });
      if (!existing) {
        console.error("No booking found for bookingId:", bookingId);
        return res.status(404).json({ error: "Booking not found" });
      }

      // Idempotency: Stripe may deliver the same event more than once
      if (existing.paymentStatus === "Completed") {
        return res.status(200).json({ received: true });
      }

      const amount = (session.amount_total / 100).toFixed(2);
      const paymentEnvironment = event.livemode ? "Production" : "Test";

      const booking = await Booking.findOneAndUpdate(
        { bookingId },
        {
          paymentStatus: "Completed",
          paymentIntentId: session.payment_intent,
          amount,
          paymentEnvironment,
        },
        { new: true }
      );

      await sendEmail({
        email: booking.email,
        params: buildEmailParams(booking, {
          paymentStatus: "Completed",
          paymentIntentId: session.payment_intent || "",
          amount,
        }),
      });
    }

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await Booking.findOneAndUpdate(
          { bookingId, paymentStatus: "Pending" },
          { paymentStatus: event.type === "checkout.session.expired" ? "Expired" : "Failed" }
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    // 500 so Stripe retries
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};