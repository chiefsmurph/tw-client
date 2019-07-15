const { CronJob } = require('cron');

const regCronIncAfterSixThirty = ({ name, min, fn }) => {
    const d = new Date();
    d.setHours(9, 30);
    const newDateObj = new Date(d.getTime() + min * 60000);
    newDateObj.setSeconds(0);
    const cronStr = `${newDateObj.getMinutes()} ${newDateObj.getHours()} * * 1-5`;
    console.log({ cronStr, name });
    new CronJob(cronStr, () => {
        console.log('starting cron: ', name);
        const callFn = () => fn(min);
        if (min === 0) {
            setTimeout(callFn, 5000);
        } else {
            callFn();
        }
    }, null, true);
};


module.exports = regCronIncAfterSixThirty;
