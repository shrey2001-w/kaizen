const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./db");
const ridesRoutes = require("./routes/ridesRoutes");
const themeSettingsRoutes = require("./routes/themesRoutes");
const vehiclesRoutes = require("./routes/vehiclesRoutes");
const priceCalculation = require("./routes/calculateDistance");
const stripeRoutes = require("./routes/stripeRoutes");

connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Stripe verifies the signature against the exact raw bytes of the request,
// so this MUST be registered BEFORE express.json().
// (stripeRoutes also applies express.raw on this route; this line makes the
// order explicit and safe.)
app.use("/api/webhook", express.raw({ type: "application/json" }));

// JSON parser for every other route
app.use(express.json());

// API Routes
app.use("/api/rides", ridesRoutes);
app.use("/api/theme-settings", themeSettingsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/prices", priceCalculation);
// Exposes: POST /api/create-checkout and POST /api/webhook
app.use("/api", stripeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});