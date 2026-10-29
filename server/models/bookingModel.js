const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  bookingId: { type: String, required: true },
  rideOption: { type: String, required: true },
  pickUpDate: { type: String, required: true },
  pickUpTime: { type: String, required: true },
  origins: { type: String, required: true },
  destinations: { type: String, required: true },
  numberPassengers: { type: Number, required: true },
  paymentStatus: { type: String, default: "Pending" },
  paymentIntentId: { type: String },  // New field for Stripe Payment Intent ID
  addOns: { type: [mongoose.Schema.Types.Mixed], default: [] },
  airline: { type: String },
  flightNumber: { type: String },
  phoneNumber: { type: String },
  hourlyService: { type: String },
  carChoice: { type: String},
  seatOption: { type: String },
  amount: { type: Number, default: 0 },
  paymentEnvironment: { type: String, enum: ["Test", "Production"], default: "Test" },
  createdAt: { type: Date, default: Date.now },
},{ timestamps: true, strict: true });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
