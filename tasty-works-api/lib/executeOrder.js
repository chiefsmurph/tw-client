'use strict';

/**
 * Execute Order
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = require('superagent');
const endpoints = require('../util/endpoints');

module.exports = (headers, account_id, symbol, price, quantity, action = "Buy to Open") => {
    const endpoint = endpoints['executeOrder'](account_id);

    const executeObj = {
        "source": "WBT",
        
        ...!price ? { 
            "order-type": "Market" 
        }: {
            "order-type": "Limit",
            "price": price 
        },
        ...action.includes('Buy') && { "price-effect": "Debit" },
        "time-in-force": "Day",
        "legs": [{
            "instrument-type": "Equity Option",
            "symbol": symbol,
            "quantity": quantity,
            "action": action 
        }]
    };

    strlog(executeObj);
    return request
        .post(`${endpoint}`)
        .set(headers)

        .send(executeObj)
        .then(res => {
            // console.log(res);
            const {
                body: {
                    data: {
                        order
                    }
                }
            } = res;

            return order;
        })
        .catch(err => console.log(err.message));
}
