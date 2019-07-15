require('./utils/my-js');
const initTW = require('./app-actions/init-tw');

const io = require('socket.io-client');
const socket = io('http://107.173.6.167:3000');
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