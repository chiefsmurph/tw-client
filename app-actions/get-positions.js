const TastyWorks = require('../tasty-works-api');
const getTrend = require('../utils/get-trend');
const {
  tickersOfInterest,
  upperLimit,
  lowerLimit,
} = require('../config');

module.exports = async () => {
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
    }))
    .map(position => ({
      ...position,
      returnDollars: +Number(Number(position.mark) * position.trend / 100).toFixed(2)
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

  return withShouldSell;

}