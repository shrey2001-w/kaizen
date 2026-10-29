const express = require("express");
const { calculatePrice } = require("../controllers/calculateDistanceController");

const router = express.Router();

router.post("/calculate", calculatePrice);

module.exports = router;
