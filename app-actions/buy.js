const TastyWorks = require('../tasty-works-api');
const util = require('util');
const yahooStockPrices = require('yahoo-stock-prices');
const cometdQuote = require('./cometd-quote');
const sendEmail = require('../utils/send-email');
const { buyAmount, tastyworks: { accountId } } = require('../config');

module.exports = async (ticker, price, foundPast, stratMin) => {
  console.log(`BUYING ${ticker}!!`);

  let multiplier = 1 // foundPast ? Math.max([
  //     Math.ceil(foundPast.avgTrend),
  //     foundPast.percUp > 50 ? 1 : 0
  // ].reduce((acc, val) => acc + val, 0), 1.5) : 1;

  console.log({ foundPast, multiplier });


  const balances = await TastyWorks.balances(accountId);
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
  } = await cometdQuote(
    ticker, 
    soonestExp['expiration-date'],
    firstOutOfMoney['strike-price'],
    'C'
  );


  const limitPrice = +((bidPrice + 0.01).toFixed(2));;

  const costOfOneShare = limitPrice * 100;
  const quantity = Math.max(1, Math.round(buyAmount / costOfOneShare));

  const withMultiplier = Math.round(quantity * multiplier);


  console.log({
    bidPrice,
    limitPrice,
    askPrice,
    quantity,
    withMultiplier
  });


  const execution = await TastyWorks.executeOrder(account, firstOutOfMoney.call, limitPrice, withMultiplier);


  const objToString = obj => Object.keys(obj).map(key => 
    key + ' ' + obj[key]
  ).join(', ');


  await sendEmail(`buying ${ticker}`, objToString({
    symbol: firstOutOfMoney.call,
    stratMin,
    bidPrice,
    askPrice,
    limitPrice,
    quantity,
    withMultiplier,
  }));

  return execution;

  
};