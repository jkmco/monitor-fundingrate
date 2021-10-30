const ccxt = require("ccxt");

const ftx = new ccxt.ftx({
  enableRateLimit: true,
});
const bybit = new ccxt.bybit({
  enableRateLimit: true,
});
const kucoin = new ccxt.kucoin({
  enableRateLimit: true,
});


module.exports = {
  ftx,
  bybit,
  kucoin,
};
