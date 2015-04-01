'use strict';

var $ = require('jquery');

$(function() {
    var FlowGraph = require('./views/flow.js');
    var CurrenciesStore = require('./stores/currencies.js');

    var currenciesStore = new CurrenciesStore({
        'flows': [
            {source: "EUR", target: "GBP", from: "1000", to: "747.10"},
            {source: "GBP", target: "EUR", from:"747.10", to: "1000"},
            {source: "RUR", target: "EUR", from:"64.14", to: "1"},
            {source: "USD", target: "RUR", from:"100", to: "5926.10"}
        ]
    });

    setTimeout(function () {
        currenciesStore.flowCollection.add([
            {source: "AUD", target: "USD", from:"1000", to: "777.53"},
            {source: "RUR", target: "EUR", from:"6414", to: "100"}
        ]);
    }, 3000);
    setTimeout(function () {
        currenciesStore.flowCollection.add([{source: "AUD", target: "USD", from:"1000000", to: "777530"}]);
    }, 6000);

    var flowGraph = new FlowGraph({
        collection: currenciesStore.flowCollection,
        title: 'Currencies flow graph',
        width: $(window).width(),
        height: 600
    });
    $('body').append(flowGraph.render().el);
});