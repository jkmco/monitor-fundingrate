const mongoose = require("mongoose");

const FundingRate = mongoose.model(
  "FundingRate",
  new mongoose.Schema({
    exchange: String,
    base: String,
    symbol: String,
    rate: Number,
    next: String,
    predicted: Number,
    updatedAt: Date,
  })
);

module.exports = FundingRate;
