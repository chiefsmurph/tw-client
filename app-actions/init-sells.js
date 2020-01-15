const checkForSells = require('./check-for-sells');
const dayInProgress = require('../utils/day-in-progress');
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');

let interval;
const start = () => {
  interval = setInterval(() => checkForSells(), 1000 * 60 * 8);
};

const stop = () => {
  clearInterval(interval);
  interval = null;
};

module.exports = () => {
  console.log('initting sells...');

  if (dayInProgress()) {
    console.log('day in progress, starting sells');
    start();
  } else {
    console.log('day not in progress');
  }

  regCronIncAfterSixThirty({
    name: 'MARKET OPEN start checking for sells',
    min: 0,
    fn: start
  });

  regCronIncAfterSixThirty({
    name: 'stop checking for sells',
    min: 400,
    fn: stop
  });

};