const mongoose = require("mongoose");

const priceRangeSchema = new mongoose.Schema({
  distanceGreaterEqual: { type: Number, required: true },
  distanceLessEqual: { type: Number }, // Optional for the last range
  price: { type: Number, required: true },
});

const priceMapSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, required: true }, // Example: 'bluefox', 'silverfox'
    pricing: { type: [priceRangeSchema], required: true },
  },
  {
    timestamps: true,
  }
);

// Check if the model already exists before defining it
module.exports = mongoose.models.PriceMap || mongoose.model("PriceMap", priceMapSchema);
