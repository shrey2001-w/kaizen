const { Client, Environment } = require('square/legacy');

const square = new Client({
  environment: Environment.Production, // change to Production for live
  bearerAuthCredentials: { accessToken: process.env.SQUARE_ACCESS_TOKEN },
});

module.exports = square;