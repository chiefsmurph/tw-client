require('./utils/my-js');
const initTW = require('./app-actions/init-tw');

const { endpoint } = require('./config');
console.log({ endpoint })
const io = require('socket.io-client');
const socket = io(endpoint);
const initSells = require('./app-actions/init-sells');
const socketHandlers = require('./app-actions/socket-handlers');

socketHandlers(socket);
socket.on('connect', function() { console.log('connect') });
socket.on('disconnect', function(){});

(async () => {
    // init TW
    await initTW();
    initSells();
})();