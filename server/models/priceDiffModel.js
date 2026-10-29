const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true }, // Example: 'chauffeur', 'hourly'
  price: { type: Number, required: true },
});

const conditionedPriceSchema = new mongoose.Schema(
  {
    rideType: { type: String, required: true }, // Example: 'chauffeur', 'hourly'
    pricing: { type: [priceSchema], required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error
module.exports = mongoose.models.ConditionedPrice || mongoose.model("ConditionedPrice", conditionedPriceSchema);
