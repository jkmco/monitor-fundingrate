const mongoose = require("mongoose");

const FundingRateDifference = mongoose.model(
  "FundingRateDifference",
  new mongoose.Schema({
    base: String,
    difference: Number,
    maxEx: String,
    maxSymbol: String,
    maxRate: Number,
    minEx: String,
    minSymbol: String,
    minRate: Number,
    updatedAt: Date,
  })
);

module.exports = FundingRateDifference;
