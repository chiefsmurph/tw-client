const TastyWorks = require('../tasty-works-api');
const getTrend = require('../utils/get-trend');
const sell = require('./sell');

const UPPER_LIMIT = 40;
const LOWER_LIMIT = -25;
const dontSell = ['SPY']

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
    }))
    .map(position => ({
      ...position,
      trend: getTrend(position.currentPrice, position.openPrice)
    }));

  const withShouldSell = analyzed.map(position => ({
    ...position,
    shouldSell: dontSell.every(t => !position.symbol.includes(t)) &&
      (position.trend > UPPER_LIMIT || position.trend < LOWER_LIMIT)
  }));

  strlog(withShouldSell)

  const selling = withShouldSell.filter(position => position.shouldSell || sellAll);
  for (let position of selling) {
    console.log(`SELLING ${position.symbol}`)
    await sell(position.symbol, position.quantity);
  }
}