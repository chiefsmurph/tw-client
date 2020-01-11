const buy = require('./buy');

const tickersBoughtToday = [];
let fiveDay;



const phrasesEnabled = [
    'rsi-spy-10min-rsilt30',
    'rsi-spy-10min-rsilt25',
    'rsi-spy-10min-rsilt20',
    'rsi-spy-10min-rsilt15',
];




const handlePick = async data => {
    const {
        stratMin,
        forPurchasePick,
        withPrices
    } = data;


    if (!phrasesEnabled.some(phrase => stratMin.includes(phrase))) {
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
        // console.log("not buying ", ticker, price, foundPast, stratMin)
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
        predictionModels = data.predictionModels;
    });
    socket.on('server:picks-data', handlePick);

};