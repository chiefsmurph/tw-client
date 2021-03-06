const getPositions = require('./get-positions');
const { activeDispersals = {}, dollarsPerDisperse, clearDispersalsEOD } = require('../config');
const sell = require('./sell');
const sendEmail = require('../utils/send-email');
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');


const initDispersal = async (position, quantityToDisperse) => {
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
  
  console.log('hii')
  let numDispersed = 0;
  const disperse = async i => {
    const numLeft = quantityToDisperse - numDispersed;
    const q = Math.min(quantityPerDisperse, numLeft);
    const positions = await getPositions();
    if (q <= 0) return sendEmail(`Q LESS THAN OR EQUAL TO 0`, JSON.stringify({ numDispersed, quantityToDisperse }, null, 2));
    await sell(symbol, q);
    await sendEmail(`DISPERSING ${symbol} - ${i+1}/${numDispersals} q ${q}`, JSON.stringify({ data, q, numDispersed, numLeft, positions }, null, 2));
    numDispersed = numDispersed + q;
  };

  minArray.forEach((min, i) =>
    regCronIncAfterSixThirty({
      name: `DISPERSING ${symbol} - ${i+1}/${numDispersals}`,
      min,
      fn: () => disperse(i)
    })
  );

  if (clearDispersalsEOD) {
    regCronIncAfterSixThirty({
      name: `CLEAR ${symbol}`,
      min: 389,
      fn: async () => {
        const positions = await getPositions();
        const pos = positions.find(position => position.symbol === symbol);
        await sell(symbol, pos.quantity);
        await sendEmail(`CLEAR ${symbol} ${pos.quantity} shares`, JSON.stringify(positions, null, 2))
      }
    });
  }

  await sendEmail(`INIT DISPERSE ${symbol} - numDispersals ${numDispersals} quantityPerDisperse ${quantityPerDisperse}`, JSON.stringify({ ...data }, null, 2));
  
};


module.exports = async () => {
  const positions = await getPositions();

  Object.keys(activeDispersals).forEach(symbol => {

    initDispersal(
      positions.find(position => position.symbol === symbol),
      activeDispersals[symbol]
    );


  });


};