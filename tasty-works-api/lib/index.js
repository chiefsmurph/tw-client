'use strict';

const _authorization = require('./authorization');
const _accounts = require('./accounts');
const _balances = require('./balances');
const _positions = require('./positions');
const _liveOrders = require('./liveOrders');
const _executeOrder = require('./executeOrder');
const _cancelOrder = require('./cancelOrder');
const _history = require('./history');
const _streamer = require('./streamer');
const _optionChain = require('./optionChain');

let _headers = require('../util/defaultHeaders');

let _user = {
    username: null,
    password: null,
    authorization_token: null,
    accounts: []
};

module.exports = {
    setUser: user => {
        _user = {
            ..._user,
            ...user
        };
    },
    getUser: () => _user,
    setAuthorizationToken: (authorization_token) => _headers['Authorization'] = authorization_token,
    getHeaders: () => _headers,

    authorization: () => _authorization(_user.username, _user.password, _headers),
    accounts: () => _accounts(_headers),
    balances: (account_id) => _balances(_headers, account_id),
    positions: (account_id) => _positions(_headers, account_id),
    liveOrders: (account_id) => _liveOrders(_headers, account_id),
    executeOrder: (account_id, symbol, price, quantity, action) => _executeOrder(_headers, account_id, symbol, price, quantity, action),
    cancelOrder: (account_id, order_id) => _cancelOrder(_headers, account_id, order_id),
    streamer: () => _streamer(_headers),
    history: (account_id, start_date, end_date) => _history(_headers, account_id, start_date, end_date),
    optionChain: (ticker) => _optionChain(_headers, ticker),
}
