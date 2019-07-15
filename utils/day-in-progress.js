const getMinutesFrom630 = require('./get-minutes-from-630');

const START_MIN = 0;
const STOP_MIN = 390;

module.exports = (startMin = START_MIN) => {
  // if between start and end times then start() on init
  const min = getMinutesFrom630();
  console.log({ min })
  const isBetweenMinutes = Boolean(min > startMin && min < STOP_MIN);
  const isWeekday = [0, 6].every(day => (new Date()).getDay() !== day);
  return isBetweenMinutes && isWeekday;
};