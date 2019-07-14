const TastyWorks = require('../tasty-works-api');
const { tastyworks: credentials } = require('../config');

module.exports = async () => {
  

  TastyWorks.setUser(credentials);



  const token = await TastyWorks.authorization();
  TastyWorks.setAuthorizationToken(token);


  const accounts = await TastyWorks.accounts();
  console.log({ accounts });
  TastyWorks.setUser({ accounts });
  console.log('Session is active, continue with other calls.');
};