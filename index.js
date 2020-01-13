require('./utils/my-js');
const initTW = require('./app-actions/init-tw');

const { endPoint } = require('./config');

const io = require('socket.io-client');
const socket = io(endPoint);
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