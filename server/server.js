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

const bodyParser = require("body-parser");

app.use(cors());

// Middleware to capture raw body for Stripe webhooks
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      if (req.originalUrl === "/api/webhook") {
        req.rawBody = buf.toString(); // Capture raw body for Stripe
      }
    },
  })
);

// Middleware for parsing JSON requests for other routes
app.use(express.json());

// API Routes
app.use("/api/rides", ridesRoutes);
app.use("/api/theme-settings", themeSettingsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/prices", priceCalculation);
app.use("/api", stripeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
