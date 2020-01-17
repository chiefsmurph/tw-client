require('./utils/my-js');
const initTW = require('./app-actions/init-tw');

const { endpoint } = require('./config');
console.log({ endpoint })
const io = require('socket.io-client');
const socket = io(endpoint);
const initSells = require('./app-actions/init-sells');
const initDispersals = require('./app-actions/init-dispersals');

const socketHandlers = require('./app-actions/socket-handlers');
const getPositions = require('./app-actions/get-positions');

socketHandlers(socket);
socket.on('connect', function() { console.log('connect') });
socket.on('disconnect', function(){});

(async () => {
    // init TW

    console.log('initializing TW...');
    await initTW();
    
    console.log('initializing sells...');
    initSells();

    console.log('initializing dispersals...')
    initDispersals();

    console.log('done intiializing.  current positions....')
    strlog(await getPositions());
})();