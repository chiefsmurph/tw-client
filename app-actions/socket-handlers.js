const buy = require('./buy');

const tickersBoughtToday = [];
let fiveDay;

const { phrasesEnabled } = require('../config');


const handlePick = async data => {
    const {
        stratMin,
        forPurchasePick,
        withPrices
    } = data;
    if (stratMin.includes('SPY')) {
        console.log('SPY pick found', data);
    }
    const matchesPhrase = phrasesEnabled.some(phrase => stratMin.includes(phrase));
    if (!matchesPhrase) {
        return console.log('pick not of interest');
    }

    console.log({ data });
    if (withPrices.length !== 1) return console.log(`I did not like ${JSON.stringify(data, null, 2)}`);

    // const hour = (new Date()).getHours();
    // if (hour >= 15) return console.log('no buying after 3pm');

    const { ticker, price } = withPrices[0];

    console.log(`received ${stratMin}: ${ticker}`);
    console.log(`${(new Date()).toLocaleString()} RECEIVED FORPURCHASE PICK: ${stratMin} - ${ticker}`);

    // if (price < 15) return console.log(`not buying ${ticker} because under $15`);
    // if (tickersBoughtToday.includes(ticker)) return console.log(`not buying ${ticker} already alerted today`);
    // if (Math.random() > 0.6) return console.log(`not buying ${ticker} because did not pass random check`);

    tickersBoughtToday.push(ticker);

    const foundPast = fiveDay[stratMin];
    try {
        // console.log("not buying ", ticker, price, foundPast, stratMin);
        console.log('waiting for a minute first spray');
        await new Promise(resolve => setTimeout(resolve, 1000 * 60));
        await buy(ticker, price, foundPast, stratMin);
        console.log('waiting for a minute for spray two');
        await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
        await buy(ticker, price, foundPast, stratMin);
        console.log('waiting for a minute for spray three');
        await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
        await buy(ticker, price, foundPast, stratMin);
    } catch (e) {
        console.error(e);
    }
    
    console.log(`done buying ${ticker}`);
};

module.exports = socket => {
    socket.on('server:data-update', data => {
        console.log('setting welcome data. yeah!');
        fiveDay = data && data.pastData ? data.pastData.fiveDay : fiveDay;
        predictionModels = data.predictionModels || predictionModels;
    });
    socket.on('server:picks-data', handlePick);
};