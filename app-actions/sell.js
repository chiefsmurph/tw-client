const TastyWorks = require('../tasty-works-api');
const sendEmail = require('../utils/send-email');

module.exports = async (symbol, quantity) => {
  const user = TastyWorks.getUser();
  const account = user.accounts[0]['account-number'];
  await TastyWorks.executeOrder(account, symbol, null, quantity, 'Sell to Close');
  await sendEmail(`sold ${symbol}`);
};