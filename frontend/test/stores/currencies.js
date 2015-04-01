'use strict';

var CurrenciesStore = require('../../stores/currencies.js');

describe('Test currencies store.', function() {
    var currenciesStore;

    beforeEach(function() {
        currenciesStore = new CurrenciesStore({
            'flows': [
                {source: "EUR", target: "GBP", from: 1000, to: 747.10},
                {source: "GBP", target: "EUR", from: 747.10, to: 1000},
                {source: "RUR", target: "EUR", from: 64.14, to: 1},
                {source: "USD", target: "RUR", from: 100, to: 5926.10}
            ]
        });
    });

    describe("Currencies store", function() {
        it('has flowCollection', function() {
            expect(currenciesStore.flowCollection).not.toBeNull();
        });

        it('has right number of flowCollection items', function() {
            expect(currenciesStore.flowCollection.length).toBe(4);
        });
    });

    describe("An updated Currencies store", function() {
        var foo, spyFlowsCollection, spyStoreCollection;

        beforeEach(function() {
            foo = {
                onAddFlow: function(flowsCollection, storeCollection) {
                    spyFlowsCollection = flowsCollection;
                    spyStoreCollection = storeCollection;
                }
            };
            spyOn(foo, 'onAddFlow').and.callThrough();
            currenciesStore.flowCollection.on('flows:add', foo.onAddFlow);

            currenciesStore.flowCollection.add([
                {source: "AUD", target: "USD", from: "1000", to: "777.53"},
                {source: "RUR", target: "EUR", from: "6414", to: "100"}
            ]);
        });

        it('has right number of flowCollection items', function() {
            expect(currenciesStore.flowCollection.length).toBe(6);
        });

        it('triggers flows:add event', function() {
            expect(foo.onAddFlow).toHaveBeenCalled();
        });

        it('flows:add event handler has proper arguments', function() {
            expect(spyFlowsCollection.length).toBe(2);
            expect(spyStoreCollection).toEqual(currenciesStore.flowCollection);
        });
    });
});