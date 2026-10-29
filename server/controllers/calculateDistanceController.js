const PriceMap = require("../models/priceModel");
const conditionedPrice = require("../models/priceDiffModel");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Flat fee for every distance-based ride (same for all cars and routes)
const FLAT_FEE = 100;

// Only these two cities are accepted
const ALLOWED_CITIES = ["Noida", "Gurgaon"];

async function calculatePrice(req, res) {
  const { origins, destinations, rideOption, hourlyservice } = req.body;

  const isHourly = rideOption === "Hourly Service" || rideOption === "Chauffeur";

  if (!rideOption) {
    return errorResponse(res, 400, "Please select a ride option.");
  }
  if (!origins) {
    return errorResponse(res, 400, "Missing required parameter: origins.");
  }
  if (!ALLOWED_CITIES.includes(origins)) {
    return errorResponse(res, 400, "Pick-up must be Noida or Gurgaon.");
  }
  if (!isHourly) {
    if (!destinations) {
      return errorResponse(res, 400, "Missing required parameter: destinations.");
    }
    if (!ALLOWED_CITIES.includes(destinations)) {
      return errorResponse(res, 400, "Drop-off must be Noida or Gurgaon.");
    }
  }

  try {
    // Hourly Service / Chauffeur: uses hourly rates from DB
    if (isHourly) {
      const hours = Number(hourlyservice);
      if (!hours || hours <= 0) {
        return errorResponse(res, 400, "Invalid or missing hourly service value.");
      }

      const ridePricingData = await conditionedPrice.findOne({ rideType: rideOption });
      if (!ridePricingData) {
        console.error(`[calculate] No priceDiff doc for rideType: "${rideOption}"`);
        return errorResponse(res, 404, `No pricing data found for rideOption: ${rideOption}`);
      }

      const results = ridePricingData.pricing.map((entry) => ({
        carType: entry.vehicleType,
        hourlyRate: entry.price,
        totalHours: hours,
        totalPrice: entry.price * hours,
      }));

      return successResponse(res, 200, "Price calculation completed successfully.", { results });
    }

    // Flat-rate rides: only car names are read from DB
    const allVehicles = await PriceMap.find({}, "vehicleType");
    if (!allVehicles || allVehicles.length === 0) {
      console.error("[calculate] PriceMap returned 0 vehicles. Check collection name / data.");
      return errorResponse(res, 404, "No vehicle data found.");
    }

    const results = allVehicles.map((vehicle) => ({
      carType: vehicle.vehicleType,
      distance: 0,
      unitPrice: FLAT_FEE,
      additionalFee: 0,
      totalPrice: FLAT_FEE,
    }));

    return successResponse(res, 200, "Price calculation completed successfully.", { results });
  } catch (error) {
    console.error("Error in calculatePrice:", error.message);
    return errorResponse(res, 500, "An error occurred during price calculation.");
  }
}

module.exports = { calculatePrice };