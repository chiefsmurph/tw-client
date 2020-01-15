const sendEmail = require('../utils/send-email');
const getPositions = require('./get-positions');

module.exports = async (sellAll = false) => {

  console.log(`${(new Date()).toLocaleString()} CHECKING FOR SELLS`);

  const withShouldSell = await getPositions();
  strlog({withShouldSell})

  const selling = withShouldSell.filter(position => position.shouldSell || sellAll);
  for (let position of selling) {
    const { symbol, quantity, trend } = position;
    console.log(`SELLING ${symbol}`);
    // await sell(symbol, quantity);
    await sendEmail(`SOLD ${symbol} at ${trend}%`, JSON.stringify(position, null, 2));
  }
}