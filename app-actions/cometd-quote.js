const TastyWorks = require('../tasty-works-api');

require('../cometd-nodejs-client/cometd-nodejs-client').adapt();

// Obtain the CometD APIs.
var lib = require('cometd');

// Create the CometD object.
var cometd = new lib.CometD();


module.exports = (symbol, exp, strike, type = 'C') => {

  console.log({ symbol, exp, strike, type });
  //'SPY   190715C00299500'
  // symbol = '.SPY190729P297';
  // symbol = '.SPY190715C00301000';


  symbol =  [
    '.',
    symbol,
    (() => {
      const [year, month, day] = exp.split('-');
      return [
        year.slice(-2),
        month,
        day
      ].join('');
    })(),
    type,
    strike.includes('.0') ? strike.split('.')[0] : strike
  ].join('');

  console.log({ symbol });
  return new Promise(async resolve => {


    const streamer = await TastyWorks.streamer();


    cometd.registerExtension('auth', {
      incoming: data => {
        

        if (data.channel === '/service/data') {
          // console.log(JSON.stringify({ incoming: data }, null, 2));

          const [meta, values] = data.data;
          const [title, fields] = meta;
          const formatted = fields.reduce((acc, field, index) => ({
            ...acc,
            [field]: values[index]
          }), {});
          // console.log({
          //   [title]: formatted
          // });

          if (title === 'Quote') {
            resolve(formatted);
          }

          // symbol
        }

        return data;
      },
      outgoing: (message) => {
        
        const m = {
          ...message,
          ...!Object.keys(message).includes('clientId') && { 
            ext: {
              'com.devexperts.auth.AuthToken': streamer.token,
            },
          },
  
          ...message.subscription && {
            channel: message.subscription
          }
        }
        delete m.subscription;
        // console.log(JSON.stringify({ outgoing: m }, null, 2))
        return m;
      }
    });
    
    const url = `${streamer['websocket-url']}/cometd`;
    console.log({url})
    cometd.configure({
      url,
      requestHeaders: {
        'Upgrade': 'websocket',
        'Origin': 'https://trade.tastyworks.com',
        // 'Sec-WebSocket-Key': 'X7rJb6zD/sz4kFOL2bimSg==',
        // 'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
      }
    });
    
    // Handshake with the server.
    cometd.handshake(function(h) {
      // console.log(JSON.stringify({ h}, null, 2))
      if (h.successful) {
        console.log('success!')
          // Subscribe to receive messages from the server.
          // cometd.subscribe('/topic', function(m) {
          //     var dataFromServer = m.data;
          //     // Use dataFromServer.
          // });
          // cometd.subscribe('/meta/connect', data => console.log({ data }));
  
          setTimeout(() => {
  
            cometd.subscribe('/service/sub', function(m) {
                console.log('subscribe!', m);
            }, {
              data: {
                add: {
                  "Trade": [
                    symbol
                  ],
                  "Quote": [
                    symbol
                  ],
                  "Summary": [
                    symbol
                  ],
                  "Profile": [
                    symbol
                  ]
                }
              }
            }, message => {
              console.log('woah', message);
            });
  
          }, 3000)
      }
    });
    
    // setInterval(() => {
    //   console.log('second')
    // }, 1000);

    

  });


};