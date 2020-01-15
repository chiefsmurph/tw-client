const sendEmail = require('../utils/send-email');
const getPositions = require('./get-positions');

const soldToday = {};

module.exports = async (sellAll = false) => {

  console.log(`${(new Date()).toLocaleString()} CHECKING FOR SELLS`);

  const withShouldSell = await getPositions();
  strlog({withShouldSell})

  const selling = withShouldSell.filter(position => position.shouldSell || sellAll);
  for (let position of selling) {
    const { symbol, quantity, trend, returnDollars } = position;
    const timesSoldToday = Number(soldToday[symbol] || 0);
    if (timesSoldToday) {
      console.log('already sold today - time to close it out');
    }
    const sharesToSell = timesSoldToday ? quantity : Math.ceil(quantity / 2);
    console.log(`SELLING ${symbol} ${sharesToSell}`);
    await sell(symbol, sharesToSell);
    await sendEmail(`SOLD ${symbol} at ${trend}% (~${returnDollars}) timesSoldToday ${timesSoldToday}`, JSON.stringify(position, null, 2));
    soldToday[symbol] = timesSoldToday + 1;
  }
}