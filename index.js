const TastyWorks = require('./tasty-works-api');
const initTW = require('./app-actions/init-tw');
const checkForSells = require('./app-actions/check-for-sells');
const buy = require('./app-actions/buy');
const regCronIncAfterSixThirty = require('./utils/reg-cron-after-630');

const io = require('socket.io-client');
const socket = io('http://107.173.6.167:3000');

socket.on('connect', function() { console.log('connect') });

const tickersBoughtToday = [];
let fiveDay = {};
socket.on('server:welcome', data => {
    // console.log({welcome: data})
    console.log('setting welcome data. yeah!');
    fiveDay = data.pastData.fiveDay;
    // console.log(fiveDay['rsi-rhtop100-5min-rsilt25-under300-firstAlert-notWatchout-brunch-5000'])


    // const pick = {
    //     forPurchasePick: true,
    //     stratMin: 'rsi-rhtop100-5min-rsilt25-under300-firstAlert-notWatchout-brunch-5000',
    //     withPrices: [{
    //         ticker: 'ROKU',
    //         price: 102.16
    //     }]
    // }

    // const pick = {
    //     forPurchasePick: true,
    //     stratMin: 'rsi-rhtop100-5min-rsilt30-under300-firstAlert-notWatchout-lunch-5000',
    //     withPrices: [{
    //         ticker: 'FB',
    //         price: 201.16
    //     }]
    // };

    
    // setTimeout(() => handlePick(pick), 2000);
});


const handlePick = async data => {
    console.log({data});
    const {
        stratMin,
        forPurchasePick,
        withPrices
    } = data;
    if (!forPurchasePick) return;
    if (withPrices.length !== 1) return console.log(`I did not like ${JSON.stringify(data, null, 2)}`);

    
    const { ticker, price } = withPrices[0];

    console.log(`received ${stratMin}: ${ticker}`);
    console.log(`${(new Date()).toLocaleString()} RECEIVED FORPURCHASE PICK: ${stratMin} - ${ticker}`);

    if (price < 15) return console.log(`not buying ${ticker} because under $15`);
    if (tickersBoughtToday.includes(ticker)) return console.log(`not buying ${ticker} already alerted today`);
    if (Math.random() > 0.6) return console.log(`not buying ${ticker} because did not pass random check`);

    tickersBoughtToday.push(ticker);

    const foundPast = fiveDay[stratMin];

    let multiplier = foundPast ? Math.max([
        Math.ceil(foundPast.avgTrend),
        foundPast.percUp > 50 ? 1 : 0
    ].reduce((acc, val) => acc + val, 0), 1.5) : 1;
    console.log({ foundPast, multiplier });
    await buy(ticker, price, multiplier);
    console.log(`done buying ${ticker}`);
};
socket.on('server:picks-data', handlePick);


socket.on('disconnect', function(){});


global.strlog = obj => console.log(JSON.stringify(obj, null, 2));

(async () => {

    // init TW

    await initTW();

    console.log('======= USER OBJECT =======');
    console.log(TastyWorks.getUser());
    console.log('======= ACCOUNT BALANCES =======');
    const balances = await TastyWorks.balances('5WU18519');
    console.log(balances);

})();

setInterval(() => checkForSells(), 1000 * 60 * 8);
regCronIncAfterSixThirty({
    name: 'start checking for sells',
    min: 0,
    fn: () => {
        console.log('woah');
        setInterval(() => checkForSells(), 1000 * 60 * 8);
    }
})