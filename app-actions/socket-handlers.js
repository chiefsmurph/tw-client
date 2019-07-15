const buy = require('./buy');

const tickersBoughtToday = [];
let fiveDay;

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

    // if (price < 15) return console.log(`not buying ${ticker} because under $15`);
    if (tickersBoughtToday.includes(ticker)) return console.log(`not buying ${ticker} already alerted today`);
    if (Math.random() > 0.6) return console.log(`not buying ${ticker} because did not pass random check`);

    tickersBoughtToday.push(ticker);

    const foundPast = fiveDay[stratMin];
    try {
        await buy(ticker, price, foundPast, stratMin);
    } catch (e) {
        console.error(e);
    }
    
    console.log(`done buying ${ticker}`);
};

module.exports = socket => {

    socket.on('server:welcome', data => {
        console.log('setting welcome data. yeah!');
        fiveDay = data.pastData.fiveDay;
    });
    socket.on('picks-data', handlePick);

};