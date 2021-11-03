const { bot } = require("./connectTelegram");
const FundingRateDifference = require("../models/FundingRateDifference");

const {
  getAllAppConfig,
  getAppConfig,
  getAppConfigValue,
  saveAppConfig,
  deleteAppConfig,
} = require("./appConfigService");

////////////////////// usage //////////////////////////////////////////
// * it will first get top funding rate from database by limit
// * getTopFundingRate() is for getting result from database
// * saveFundingRateToAppConfig() is for updating the newest funding rate to appConfig for further use
// * generateFundingRateAlert() will send message to telegram
/*
const { generateFundingRateAlert, saveFundingRateToAppConfig} = require("./services/generateFundingRateAlert");
(async () => {
  await generateFundingRateAlert(3);
  await saveFundingRateToAppConfig(3);
})();
 */
//////////////////////////////////////////////////////////////////////

async function getTopFundingRate(limit) {
  try {
    const result = await FundingRateDifference.find()
      .sort({ difference: -1 })
      .limit(limit);

    return result;
  } catch (error) {
    console.log("[Error from generateAlert > getTopFundingRate] : ", error);
  }
}

async function saveFundingRateToAppConfig(limit) {
  try {
    const fundingRates = await getTopFundingRate(limit);
    const result = await saveAppConfig(
      "monitor-fundingrate@topFundingRate",
      fundingRates
    );
    console.log(`>>> saved funding rate to appConfig : ${result.status}`);
  } catch (error) {
    console.log(
      "[Error from generateAlert > saveFundingRateToAppConfig] : ",
      error
    );
  }
}

async function generateFundingRateAlert(limit) {
  try {
    const result = await getTopFundingRate(limit); // can use appConfig to replace later
    const time = new Date(Date.now());

    let content = "";
    content += `💸💸💸 This hour top ${limit} funding rate💸💸💸\n`;

    for (i in result) {
      content += `#${parseInt(i) + 1}\n`;
      content += `${result[i].base} : ${(result[i].difference * 100).toFixed(
        3
      )}%\n`;
      content += `${result[i].maxEx} (${(result[i].maxRate * 100).toFixed(
        3
      )}%) > ${result[i].minEx} (${(result[i].minRate * 100).toFixed(3)}%)\n\n`;
    }

    bot.sendMessage("@tradeblocks_bot", content);
    console.log(`>>> generated funding rate alert ${time.toISOString()}`);
  } catch (error) {
    console.log("[Error from generateAlert] : ", error);
  }
}

module.exports = { generateFundingRateAlert, saveFundingRateToAppConfig };
