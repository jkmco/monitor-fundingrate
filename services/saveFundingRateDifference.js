const FundingRate = require("../models/FundingRate");
const FundingRateDifference = require("../models/FundingRateDifference");
const { allFutures } = require("./getFutures");
/////////////////////  how to use /////////////////////////
/*
const { saveFundingRateDifference } = require("./utils/saveFundingRateDifference");

(async () => {
  await saveFundingRateDifference(["ftx", "bybit"]);
})();
*/
/////////////////////  how to use /////////////////////////

async function getFundingRatebyBase(base, exchangeArray) {
  const result = await FundingRate.find({
    base: base,
    exchange: { $in: exchangeArray },
    rate: { $ne: null },
  }).select({ _id: 0, exchange: 1, symbol: 1, rate: 1 });

  return result;
}

async function saveFundingRateDifference(exchangeArray) {
  await FundingRateDifference.deleteMany(); // delete all existing fundingratedifference

  for (i in allFutures) {
    // loop through all futures symbol
    const result = await getFundingRatebyBase(allFutures[i], exchangeArray);
    let res = {
      base: allFutures[i],
      difference: 0,
      maxEx: "",
      maxSymbol: "",
      maxRate: 0,
      minEx: "",
      minSymbol: "",
      minRate: 10,
    };

    if (result.length > 1) {
      // loop through all funding rate under same base in exchanges
      for (i in result) {
        if (result[i].rate > res.maxRate) {
          res.maxEx = result[i].exchange;
          res.maxSymbol = result[i].symbol;
          res.maxRate = result[i].rate;
        }
        if (result[i].rate < res.minRate) {
          res.minEx = result[i].exchange;
          res.minSymbol = result[i].symbol;
          res.minRate = result[i].rate;
        }
      }
      res.difference = res.maxRate - res.minRate;

      console.log(`***** Saving ${res.base} Funding Rate Difference *****`);

      await FundingRateDifference.updateOne(
        { base: res.base },
        {
          $set: {
            difference: res.difference,
            maxEx: res.maxEx,
            maxSymbol: res.maxSymbol,
            maxRate: res.maxRate,
            minEx: res.minEx,
            minSymbol: res.minSymbol,
            minRate: res.minRate,
          },
          $currentDate: { updatedAt: true },
        },
        { upsert: true }
      );
    }
  }
  console.log(`>> finished!`);
}

module.exports = { saveFundingRateDifference };
