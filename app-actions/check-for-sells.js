const TastyWorks = require('../tasty-works-api');
const getTrend = require('../utils/get-trend');
const sell = require('./sell');
const sendEmail = require('../utils/send-email');

const {
  tickersOfInterest,
  upperLimit,
  lowerLimit,
} = require('../config');

module.exports = async (sellAll = false) => {

  console.log(`${(new Date()).toLocaleString()} CHECKING FOR SELLS`);

  const user = TastyWorks.getUser();
  // strlog({ user});
  const account = user.accounts[0]['account-number'];
  const positions = (await TastyWorks.positions(account)).items;
  const analyzed = positions
    .map(position => ({
      symbol: position.symbol,
      quantity: position.quantity,
      openPrice: Number(position['average-open-price']),
      currentPrice: Number(position['mark-price']),
      ...position
    }))
    .map(position => ({
      ...position,
      trend: getTrend(position.currentPrice, position.openPrice)
    }));

  const withShouldSell = analyzed.map(position => {
    const { symbol, trend } = position;
    const tickerOk = tickersOfInterest.some(t => symbol.includes(t));
    const outsideOfLimits = trend > upperLimit || trend < lowerLimit;
    // console.log({ tickerOk, outsideOfLimits, symbol })
    return {
      ...position,
      tickerOk,
      outsideOfLimits,
      shouldSell: Boolean(tickerOk && outsideOfLimits)
    };
  });

  strlog({withShouldSell})

  const selling = withShouldSell.filter(position => position.shouldSell || sellAll);
  for (let position of selling) {
    const { symbol, quantity, trend } = position;
    console.log(`SELLING ${symbol}`);
    // await sell(symbol, quantity);
    await sendEmail(`SOLD ${symbol} at ${trend}%`, JSON.stringify(position, null, 2));
  }
}