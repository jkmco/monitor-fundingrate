const mongoose = require('mongoose');

const Market = mongoose.model(
  'Market',
  new mongoose.Schema({
    exchange: String,
    symbol: String,
    base: String,
    quote: String,
    type: String,
    linear: Boolean,
    inverse: Boolean,
    updatedAt: Date,
  })
);

module.exports = Market;
