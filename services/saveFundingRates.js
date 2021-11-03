const { ftx, bybit, kucoin } = require("./connectExchange");

const {
  ftxFutures,
  bybitFutures,
  //kucoinFutures,
} = require("./getFutures");

const FundingRate = require("../models/FundingRate");

/////////////////////  how to use /////////////////////////
/*
  const { saveFundingRates } = require("./services/saveFundingRates");
  
  (async () => {
    await saveFundingRates(["ftx", "bybit", "kucoin"]);
  })();
  */
/////////////////////  how to use /////////////////////////

async function saveFundingRates(exchangeArray) {
  if (exchangeArray.includes("ftx")) await saveFtx();
  if (exchangeArray.includes("bybit")) await saveBybit();
  if (exchangeArray.includes("kucoin")) await saveKucoin();
}

async function saveFtx() {
  for (i in ftxFutures) {
    const raw = await ftx.publicGetFuturesFutureNameStats({
      future_name: ftxFutures[i].symbol,
    });

    if (raw.result.nextFundingRate) {
      // save perp futures only (quarterly futures has no funding rate)
      const result = await FundingRate.updateOne(
        { exchange: "ftx", symbol: ftxFutures[i].symbol },
        {
          $set: {
            base: ftxFutures[i].base,
            rate: parseFloat(raw.result.nextFundingRate * 8),
            next: raw.result.nextFundingTime,
          },
          $currentDate: { updatedAt: true },
        },
        { upsert: true }
      );
      console.log(
        `ftx: ${ftxFutures[i].symbol} updated ${result.modifiedCount} / ${result.matchedCount} / ${result.upsertedCount}`
      );
    }
  }
  console.log("ftx done!");
  /*
      {
      success: true,
      result: {
          volume: '111272.2',
          nextFundingRate: '6e-6',
          nextFundingTime: '2021-09-16T16:00:00+00:00',
          openInterest: '40555.0'
      }
      }
      {
      success: true,
      result: {
          volume: '11.16',
          predictedExpirationPrice: '579.55',
          openInterest: '97.17'
      }
      }
    */
}

async function saveBybit() {
  for (i in bybitFutures) {
    const raw = await bybit.publicLinearGetFundingPrevFundingRate({
      symbol: bybitFutures[i].symbol,
    });

    const result = await FundingRate.updateOne(
      { exchange: "bybit", symbol: bybitFutures[i].symbol },
      {
        $set: {
          base: bybitFutures[i].base,
          rate: raw.result.funding_rate,
          next: raw.result.funding_rate_timestamp,
        },
        $currentDate: { updatedAt: true },
      },
      { upsert: true }
    );
    console.log(
      `bybit: ${bybitFutures[i].symbol} updated ${result.modifiedCount} / ${result.matchedCount} / ${result.upsertedCount}`
    );
  }
  console.log("bybit done!");
  /*
      XTZUSDT
      {
      ret_code: '0',
      ret_msg: 'OK',
      ext_code: '',
      ext_info: '',
      result: {
          symbol: 'XTZUSDT',
          funding_rate: '0.00056735',
          funding_rate_timestamp: '2021-09-16T08:00:00.000Z'
      },
      time_now: '1631807767.810740'
      }
    */
}

async function saveKucoin() {
  const raw = await kucoin.futuresPublicGetContractsActive();

  for (const i in raw.data) {
    if (!raw.data[i].isInverse) {
      // save linear futures only
      const result = await FundingRate.updateOne(
        { exchange: "kucoin", symbol: raw.data[i].symbol },
        {
          $set: {
            base: raw.data[i].baseCurrency,
            rate: raw.data[i].fundingFeeRate,
            next: raw.data[i].nextFundingRateTime,
            predicted: raw.data[i].predictedFundingFeeRate,
          },
          $currentDate: { updatedAt: true },
        },
        { upsert: true }
      );
      console.log(
        `kucoin: ${raw.data[i].symbol} updated ${result.modifiedCount} / ${result.matchedCount} / ${result.upsertedCount}`
      );
    }
  }
  console.log("kucoin done!");
  /*
    {
    symbol: 'AXSUSDTM',
    rootSymbol: 'USDT',
    type: 'FFWCSX',
    firstOpenDate: '1631779200000',
    expireDate: null,
    settleDate: null,
    baseCurrency: 'AXS',
    quoteCurrency: 'USDT',
    settleCurrency: 'USDT',
    maxOrderQty: '1000000',
    maxPrice: '1000000.0000000000',
    lotSize: '1',
    tickSize: '0.001',
    indexPriceTickSize: '0.001',
    multiplier: '0.1',
    initialMargin: '0.05',
    maintainMargin: '0.025',
    maxRiskLimit: '200000',
    minRiskLimit: '200000',
    riskStep: '100000',
    makerFeeRate: '0.00020',
    takerFeeRate: '0.00060',
    takerFixFee: '0.0000000000',
    makerFixFee: '0.0000000000',
    settlementFee: null,
    isDeleverage: true,
    isQuanto: false,
    isInverse: false,
    markMethod: 'FairPrice',
    fairMethod: 'FundingRate',
    fundingBaseSymbol: '.AXSINT8H',
    fundingQuoteSymbol: '.USDTINT8H',
    fundingRateSymbol: '.AXSUSDTMFPI8H',
    indexSymbol: '.KAXSUSDT',
    settlementSymbol: '',
    status: 'Open',
    fundingFeeRate: '0.000100',
    predictedFundingFeeRate: '0.000110',
    openInterest: '180312',
    turnoverOf24h: '4176703.16394615',
    volumeOf24h: '61811.50000000',
    markPrice: '67.447',
    indexPrice: '67.440',
    lastTradePrice: '67.4840000000',
    nextFundingRateTime: '27988061',
    maxLeverage: '20',
    sourceExchanges: [ 'huobi', 'Okex', 'Binance', 'Kucoin' ],
    premiumsSymbol1M: '.AXSUSDTMPI',
    premiumsSymbol8H: '.AXSUSDTMPI8H',
    fundingBaseSymbol1M: '.AXSINT',
    fundingQuoteSymbol1M: '.USDTINT',
    lowPrice: '65.531',
    highPrice: '69.715',
    priceChgPct: '-0.0234',
    priceChg: '-1.624'
  }
    */
}

module.exports = { saveFundingRates };
