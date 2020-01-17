const getPositions = require('./get-positions');
const { activeDispersals = {}, dollarsPerDisperse } = require('../config');
const sell = require('./sell');
const sendEmail = require('../utils/send-email');
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');


const initDispersal = (position, quantityToDisperse) => {
  let { symbol, mark, quantity } = position;
  quantityToDisperse = quantityToDisperse || position.quantity;
  console.log(`init'ng dispersal of ${symbol}, mark ${mark}, ${quantityToDisperse} quantityToDisperse`);

  mark = Number(mark);
  const perShare = mark / quantity;
  let quantityPerDisperse = Math.ceil(dollarsPerDisperse / perShare);
  const numDispersals = Math.ceil(quantityToDisperse / quantityPerDisperse);


  const numMinutesInDay = 390;
  const minutesApart = (numMinutesInDay - 10) / (numDispersals - 1);
  const minArray = Array(numDispersals).fill().map((v, i) => Math.round(i * minutesApart + 5));


  const data = { mark, quantity, quantityToDisperse, perShare, quantityPerDisperse, numDispersals, minutesApart, minArray };
  console.log(data);


  const disperse = async i => {
    await sell(symbol, quantityPerDisperse);
    await sendEmail(`DISPERSING ${symbol} - ${i+1}/${numDispersals}`, JSON.stringify(data, null, 2));
  };

  minArray.forEach((min, i) =>
    regCronIncAfterSixThirty({
      name: `DISPERSING ${symbol} - ${i+1}/${numDispersals}`,
      min,
      fn: () => disperse(i)
    })
  );

};


module.exports = async () => {
  const positions = await getPositions();

  Object.keys(activeDispersals).forEach(symbol => {
    initDispersal(
      positions.find(position => position.symbol === symbol),
      activeDispersals[symbol]
    )
  });

};