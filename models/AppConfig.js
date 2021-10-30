const mongoose = require("mongoose");

const AppConfig = mongoose.model(
  "AppConfig",
  new mongoose.Schema({
    key: String,
    value: Array,
    updatedAt: Date,
  })
);

module.exports = AppConfig;
