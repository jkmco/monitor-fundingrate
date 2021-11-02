const Market = require("../models/Market");
const {
  ftx,
  bybit,
  kucoin,
} = require("./connectExchange");

/////////////////////  how to use /////////////////////////
/*
const { saveMarkets } = require("./services/saveMarkets");

(async () => {
  await saveMarkets();
})();
*/
/////////////////////  how to use /////////////////////////

async function saveMarkets() {
  saveMarket(ftx);
  saveMarket(bybit);
  saveMarketKucoin(kucoin);
}

async function saveMarket(ex) {
  const markets = await ex.loadMarkets();

  console.log(`***** start to update ${ex.id} *****`);

  for (const m in markets) {
    await Market.updateOne(
      { exchange: ex.id, symbol: markets[m].symbol },
      {
        $set: {
          exchange: markets[m].exchange,
          symbol: markets[m].id,
          base: markets[m].base,
          quote: markets[m].quote,
          type: markets[m].type,
          linear: markets[m].linear,
          inverse: markets[m].inverse,
        },
        $currentDate: { updatedAt: true },
      },
      { upsert: true }
    );
  }

  console.log(`>> ${ex.id} finished!`);
}

async function saveMarketKucoin(ex) {
  const markets = await ex.futuresPublicGetContractsActive();

  console.log(`***** start to update ${ex.id} futures *****`);

  for (const m in markets.data) {
    await Market.updateOne(
      { exchange: ex.id, symbol: markets.data[m].symbol },
      {
        $set: {
          exchange: ex.id,
          symbol: markets.data[m].symbol,
          base: markets.data[m].baseCurrency,
          quote: markets.data[m].quoteCurrency,
          type: "futures",
          linear: !markets.data[m].isInverse,
          inverse: markets.data[m].isInverse,
        },
        $currentDate: { updatedAt: true },
      },
      { upsert: true }
    );
  }

  console.log(`>> ${ex.id} futures finished!`);
}



module.exports = { saveMarkets };

// /////////////////////////////////////////////
// /////////////     FTX         ///////////////
// /////////////////////////////////////////////
// 'ALT-0924': {
//   limits: { amount: [Object], price: [Object], cost: [Object] },
//   precision: { amount: 0.001, price: 0.05 },
//   tierBased: true,
//   percentage: true,
//   taker: 0.0007,
//   maker: 0.0002,
//   tiers: { taker: [Array], maker: [Array] },
//   id: 'ALT-0924',
//   symbol: 'ALT-0924',
//   base: 'ALT',
//   quote: 'USD',
//   baseId: 'ALT',
//   quoteId: 'USD',
//   type: 'future',
//   future: true,
//   spot: false,
//   active: true,
//   info: {
//     name: 'ALT-0924',
//     enabled: true,
//     postOnly: false,
//     priceIncrement: '0.05',
//     sizeIncrement: '0.001',
//     minProvideSize: '0.001',
//     last: '4996.55',
//     bid: '5030.1',
//     ask: '5042.8',
//     price: '5030.1',
//     type: 'future',
//     baseCurrency: null,
//     quoteCurrency: null,
//     underlying: 'ALT',
//     restricted: false,
//     highLeverageFeeExempt: false,
//     change1h: '-0.0026568850996331913',
//     change24h: '-0.11306049759314443',
//     changeBod: '-0.008349022661632939',
//     quoteVolume24h: '792619.82685',
//     volumeUsd24h: '792619.82685'
//   }
// },


/////////////////////////////////////////////
/////////////     bybit      ////////////////
/////////////////////////////////////////////
/*
'ICP/USDT': {
    limits: { amount: [Object], price: [Object], cost: [Object] },
    precision: { amount: 0.1, price: 0.01 },
    tierBased: false,
    percentage: true,
    taker: 0.00075,
    maker: -0.00025,
    id: 'ICPUSDT',
    symbol: 'ICP/USDT',
    base: 'ICP',
    quote: 'USDT',
    active: true,
    type: 'swap',
    spot: false,
    swap: true,
    futures: false,
    option: false,
    linear: true,
    inverse: false,
    info: {
      name: 'ICPUSDT',
      alias: 'ICPUSDT',
      status: 'Trading',
      base_currency: 'ICP',
      quote_currency: 'USDT',
      price_scale: '2',
      taker_fee: '0.00075',
      maker_fee: '-0.00025',
      leverage_filter: [Object],
      price_filter: [Object],
      lot_size_filter: [Object]
    }
  },
  BTCUSDH22: {
    limits: { amount: [Object], price: [Object], cost: [Object] },
    precision: { amount: 1, price: 0.5 },
    tierBased: false,
    percentage: true,
    taker: 0.00075,
    maker: -0.00025,
    id: 'BTCUSDH22',
    symbol: 'BTCUSDH22',
    base: 'BTC',
    quote: 'USD',
    active: true,
    type: 'futures',
    spot: false,
    swap: false,
    futures: true,
    option: false,
    linear: false,
    inverse: true,
    info: {
      name: 'BTCUSDH22',
      alias: 'BTCUSD0325',
      status: 'Trading',
      base_currency: 'BTC',
      quote_currency: 'USD',
      price_scale: '2',
      taker_fee: '0.00075',
      maker_fee: '-0.00025',
      leverage_filter: [Object],
      price_filter: [Object],
      lot_size_filter: [Object]
    }
  },

*/


/*
  /////////////////////////////////////////////
  //////////     kucoin futures      //////////
  /////////////////////////////////////////////
    {
      symbol: 'ETHUSDM',
      rootSymbol: 'ETH',
      type: 'FFWCSX',
      firstOpenDate: '1606737600000',
      expireDate: null,
      settleDate: null,
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      settleCurrency: 'ETH',
      maxOrderQty: '1000000',
      maxPrice: '1000000.0000000000',
      lotSize: '1',
      tickSize: '0.05',
      indexPriceTickSize: '0.01',
      multiplier: '-1.0',
      initialMargin: '0.02',
      maintainMargin: '0.01',
      maxRiskLimit: '2000',
      minRiskLimit: '2000',
      riskStep: '1000',
      makerFeeRate: '0.00020',
      takerFeeRate: '0.00060',
      takerFixFee: '0.0000000000',
      makerFixFee: '0.0000000000',
      settlementFee: null,
      isDeleverage: true,
      isQuanto: false,
      isInverse: true,
      markMethod: 'FairPrice',
      fairMethod: 'FundingRate',
      fundingBaseSymbol: '.ETHINT8H',
      fundingQuoteSymbol: '.USDINT8H',
      fundingRateSymbol: '.ETHUSDMFPI8H',
      indexSymbol: '.KETHUSD',
      settlementSymbol: '',
      status: 'Open',
      fundingFeeRate: '0.000100',
      predictedFundingFeeRate: '0.000100',
      openInterest: '27300362',
      turnoverOf24h: '6727.55141434',
      volumeOf24h: '23315894.00000000',
      markPrice: '3394.31',
      indexPrice: '3394.25',
      lastTradePrice: '3395.0500000000',
      nextFundingRateTime: '5184112',
      maxLeverage: '50',
      sourceExchanges: [Array],
      premiumsSymbol1M: '.ETHUSDMPI',
      premiumsSymbol8H: '.ETHUSDMPI8H',
      fundingBaseSymbol1M: '.ETHINT',
      fundingQuoteSymbol1M: '.USDINT',
      lowPrice: '3354.00',
      highPrice: '3557.60',
      priceChgPct: '-0.0262',
      priceChg: '-91.35'
    },
*/

