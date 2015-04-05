'use strict';

var $ = require('jquery');
var io = require('socket.io-client');

var env = process.env.NODE_ENV || 'production';
var config = require('./config/config.json')[env];

var debugModule = require('debug');
config.logging && debugModule.enable('socket');
var debug = debugModule('socket');

$(function() {
    var GeneralView = require('./views/general.js');
    var FlowGraph = require('./views/flow.js');
    var CurrenciesStore = require('./stores/currencies.js');

    var currenciesStore = new CurrenciesStore();
    var socket = io('http://' + config.socketHost + ':' + config.socketPort + '/');

    socket.on('connect', function () {
        debug('Socket connected!');
    });

    socket.on('message', function (data) {
        debug(data);
        currenciesStore.updateData(data);
    });

    socket.on('reset', function (data) {
        debug('Reset');
        // todo@ Implement it
    });

    var generalView =  new GeneralView({
        model: currenciesStore
    });
    $('header').append(generalView.render().el);

    var flowGraph = new FlowGraph({
        collection: currenciesStore.flowCollection,
        title: 'Currencies flow graph',
        width: Math.max($(window).width() - 50, 500),
        height: 600
    });
    $('body').append(flowGraph.render().el);
});
