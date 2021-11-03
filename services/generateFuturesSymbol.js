const fs = require("fs");
const Market = require("../models/Market");
const path = "./services/getFutures.js"
/////////////////////  how to use /////////////////////////
/*
const generateFuturesSymbol = require("./services/generateFuturesSymbol");

(async () => {
  generateFuturesSymbol();
})();
*/
/////////////////////  how to use /////////////////////////

async function getMarket(exName) {
  // futures type :
  // "futures": kucoin, gateio, bybit(quarter), bitfinex2
  // "future" : binanceusdm, ftx, deribit, bitmex
  // "swap"  : bybit(linear/inverse)
  let result;

  if (exName == "bybit") {
    // only get linear futures from bybit
    result = await Market.find({
      exchange: exName,
      linear: true,
    })
      .or([{ type: "futures" }, { type: "future" }, { type: "swap" }])
      .select({
        _id: 0,
        base: 1,
        symbol: 1,
      });
  } else {
    // all other exchanges find by this
    result = await Market.find({
      exchange: exName,
    })
      .or([{ type: "futures" }, { type: "future" }, { type: "swap" }])
      .select({
        _id: 0,
        base: 1,
        symbol: 1,
      });
  }

  const content = `const ${exName}Futures = ${JSON.stringify(result)}; \n`;

  fs.appendFile(
    path,
    content,
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      //file written successfully
    }
  );
}

async function getAllFutures() {
  const result = await Market.find()
    .or([{ type: "futures" }, { type: "future" }, { type: "swap" }])
    .distinct("base");

  const content = `const allFutures = ${JSON.stringify(result)}; \n`;

  fs.appendFile(path, content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    //file written successfully
  });
}

async function writeClosing() {
    const closing = `
    module.exports = {
      allFutures,
      ftxFutures,
      bybitFutures,
      kucoinFutures,
    };
    `;
  
    fs.appendFile(
      path,
      closing,
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        //file written successfully
      }
    );
}

async function generateFuturesSymbol() {
  console.log(">>> clear futures symbol records...");

  fs.writeFile(path, "", (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  console.log(">>> start to generate futures symbol...");

  await getAllFutures();
  await getMarket("ftx");
  await getMarket("bybit");
  await getMarket("kucoin");
  await writeClosing();

  console.log(">>> finished");
}

module.exports = generateFuturesSymbol;
