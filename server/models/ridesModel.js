const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  rides: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Ride", rideSchema);
