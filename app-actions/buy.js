const TastyWorks = require('../tasty-works-api');
const util = require('util');
const yahooStockPrices = require('yahoo-stock-prices');
const qcomet = require('../qcomet');

module.exports = async (ticker, price, multiplier = 1) => {
  console.log(`BUYING ${ticker}!!`);
  const balances = await TastyWorks.balances('5WU18519');
  if (Number(balances['equity-buying-power']) < 100) return console.log('NEED AT LEAST $100 TO WORK WITH');

  const curPrice = price || await util.promisify(yahooStockPrices.getCurrentPrice)(ticker);
  console.log({ curPrice });



  const chain = await TastyWorks.optionChain(ticker);
  // console.log({ chain })
  const soonestExp = chain.expirations.find(({ 'days-to-expiration': daysToExp }) => daysToExp > 0);
  // console.log(soonestExp.strikes)
  const firstOutOfMoney = soonestExp.strikes.find(({ 'strike-price': strikePrice }) => 
      strikePrice > curPrice
  );

  const user = TastyWorks.getUser();
  const account = user.accounts[0]['account-number'];

  console.log({ 
    soonestExp: soonestExp['expiration-date'], 
    firstOutOfMoney,
    price,
    multiplier
  })


  const {
    bidPrice, 
    askPrice 
  } = await qcomet(
    ticker, 
    soonestExp['expiration-date'],
    firstOutOfMoney['strike-price'],
    'C'
  );


  const limitPrice = +((bidPrice + 0.01).toFixed(2));;



  const quantity = Math.max(1, Math.floor(1 / limitPrice * multiplier));


  console.log({
    bidPrice,
    limitPrice,
    askPrice,
    quantity
  });

  return TastyWorks.executeOrder(account, firstOutOfMoney.call, limitPrice, quantity);

  
};