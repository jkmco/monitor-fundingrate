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

const {
  generateFundingRateAlert,
  saveFundingRateToAppConfig,
} = require("./services/generateFundingRateAlert");

const cron = require("node-cron");

async function init() {
  console.log(">> monitor-fundingrate initiailize >>");

  // load app config
  console.log(">> loading app config >>");

  const limit = (await getAppConfigValue("monitor-fundingrate@limit")) || 3;

  console.log(`>> app config loaded! : limit ${limit} >>`);

  // start to run

  console.log(
    `>> start to run the generateFundingRateAlert! with limit ${limit}, waiting the hourly update... >>`
  );

  cron.schedule("0 50 * * * *", async () => {
    await console.log(">> start to save funding rate ");
    await saveFundingRates(["ftx", "bybit", "kucoin"]);

    await console.log(">> start to save funding rate difference");
    await saveFundingRateDifference(["ftx", "bybit", "kucoin"]);

    await console.log(">> start to generate funding rate alert");
    await generateFundingRateAlert(limit);

    await console.log(">> start to save top funding rate into AppConfig");
    await saveFundingRateToAppConfig(limit);

    await console.log(">> finished generating funding rate!");
  });
}

init();

// listen to server
app.listen(PORT, () => {
  console.log(`Server connected. Listening Port ${PORT}...`);
});
``;
