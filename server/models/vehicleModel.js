const mongoose = require("mongoose");

// Define the schema
const VehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  price_per_km: {
    type: Number,
    required: true,
  },
  price_per_hour: {
    type: Number,
    required: true,
  },
});

// Export the model
// const Vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = mongoose.model("Vehicle", VehicleSchema);
