'use strict';

/**
 * Get Option Chain
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = require('superagent');
const endpoints = require('../util/endpoints');

module.exports = (headers, ticker) => {
    const endpoint = endpoints['optionChain'](ticker);
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            // console.log(res.body.data);
            return res.body.data.items[0];
        })
        .catch(err => err.message);
}
