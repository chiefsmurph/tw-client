const WebSocket = require('ws');
const ws = new WebSocket('wss://tasty.dxfeed.com/live/cometd');
// console.log({ ws })

ws.on('message', function(data, flags) {
  console.log({ data })
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
});

ws.on('open', function() {
    console.log('open');
    ws.send([
      {
        "ext": {
          "com.devexperts.auth.AuthToken": "dGFzdHksbGl2ZSwsMTU2MzEzMjUwOSwxNTYzMDQ2MTA5LFUwMDAxMDU4Nzc5.sH7RSgKolVsUBrHrROIIWlC0Cm5kg-pmvd3xRveIbOg"
        },
        "id": "1",
        "version": "1.0",
        "minimumVersion": "1.0",
        "channel": "/meta/handshake",
        "supportedConnectionTypes": [
          "websocket",
          "long-polling",
          "callback-polling"
        ],
        "advice": {
          "timeout": 60000,
          "interval": 0
        }
      }
    ]);

    setTimeout(() => {
      console.log('sending ')
      ws.send([{"id":"4","channel":"/service/sub","data":{"add":{"Trade":["SPY"],"Quote":["SPY"],"Summary":["SPY"],"Profile":["SPY"]}},"clientId":"2lg4fpuudpurbhe55c1oyfa0dqu84"}]);
    }, 2000)
});