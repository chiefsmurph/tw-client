require('./utils/my-js');
const initTW = require('./app-actions/init-tw');

// const test= require('./singles/test-update-wl.js');
// console.log(test);
(async () => {

  await initTW();

  const args = process.argv.slice(2).map(val => {
    if (val === 'true' || val === 'false') {
      return Boolean(val === 'true');
    } else if (!isNaN(val)) {
      return Number(val);
    } else if (val === '_') {
      return undefined; 
    } else {
      return val;
    }
  });
  console.log({ args })
  const toRun = args.shift();
  // init
  // await require('./helpers/browser').init();
  const folders = ['', 'app-actions', 'cli', 'singles', 'scraping-actions'];
  const getFile = file => {
    for (let folder of folders) {
      try {
        const path = `./${folder ? folder + '/' : ''}${file}`;
        console.log('checking', path)
        const found = require(path);
        console.log(`found at ${path}`);
        return found;
      } catch (e) {
        console.log(e)
      }
    }
  };
  const fnToRun = getFile(toRun);
  console.log({ fnToRun})
  const response = await fnToRun(...args);
  if (response) {
    console.log('------------------');
    console.log('| RESPONSE');
    console.log('------------------');
    console.log(JSON.stringify(response, null, 2));
  }

  console.log('done running');
  // un-init
  // await require('./helpers/browser').close();
  process.exit();
})();