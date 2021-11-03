// modules
const express = require("express");
const app = express();
const cors = require("cors");
const {
  getAllAppConfig,
  getAppConfig,
  getAppConfigValue,
  saveAppConfig,
  deleteAppConfig,
} = require("./services/appConfigService");

// dotenv config
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/your_db_name";
const API_URI = process.env.API_URI || "http://localhost:3000";

// middleware
app.use(cors());
app.use(express.json());

// route
// const appConfig = require("./routes/AppConfig.route");
// app.use("/app/config", appConfig);

// startup
require("./startup/db")(DB_URI);

// main

const { saveFundingRates } = require("./services/saveFundingRates");

const {
  saveFundingRateDifference,
} = require("./services/saveFundingRateDifference");

(async () => {
  await saveFundingRates(["ftx", "bybit", "kucoin"]);
  await saveFundingRateDifference(["ftx", "bybit", "kucoin"]);
})();

// listen to server
app.listen(PORT, () => {
  console.log(`Server connected. Listening Port ${PORT}...`);
});
``;
