'use strict';

var CurrenciesStore = require('../../stores/currencies.js');

describe('Test currencies store.', function() {
    var currenciesStore;

    beforeEach(function() {
        currenciesStore = new CurrenciesStore({
            "batch": 3,
            "messages": 8,
            "countries": {"RU": 1, "DE": 2, "GB": 5},
            "currencies": ["USD", "RUR", "EUR", "GBP"],
            "rates": [],
            "extra": "some extra field",
            "flows": [
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

    describe("An updated flowCollection of Currencies store", function() {
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

    describe("An updated Currencies store", function() {
        var flowCollectionHandler, spyFlowsCollection, spyStoreCollection;
        var updateHandler, spyBatch, spyMessages, spyCountries, spyCurrencies, spyFlowsCollectionUpdate;

        beforeEach(function() {
            updateHandler = {
                onUpdate: function(newData, store) {
                    spyBatch = store.batch;
                    spyMessages = store.messages;
                    spyCountries = store.countries;
                    spyCurrencies = store.currencies;
                    spyFlowsCollectionUpdate = store.flowCollection;
                }
            };
            spyOn(updateHandler, 'onUpdate').and.callThrough();
            currenciesStore.on('update', updateHandler.onUpdate);

            flowCollectionHandler = {
                onAddFlow: function(flowsCollection, storeCollection) {
                    spyFlowsCollection = flowsCollection;
                    spyStoreCollection = storeCollection;
                }
            };
            spyOn(flowCollectionHandler, 'onAddFlow').and.callThrough();
            currenciesStore.flowCollection.on('flows:add', flowCollectionHandler.onAddFlow);

            currenciesStore.updateData({
                "batch": 17,
                "messages": 1029,
                "countries": {"AU": 1, "RU": 3},
                "currencies": ["AUD", "USD"],
                "rates": [],
                "extra": "some extra field",
                "flows": [
                    {source: "AUD", target: "USD", from: "1000", to: "777.53"},
                    {source: "RUR", target: "EUR", from: "6414", to: "100"}
                ]
            });
        });

        it('has right batch number', function() {
            expect(currenciesStore.batch).toBe(17);
        });

        it('has right messages number', function() {
            expect(currenciesStore.messages).toBe(1029);
        });

        it('has right countries list', function() {
            expect(currenciesStore.countries).toEqual({ "RU": 3, "DE": 2, "GB": 5, "AU": 1 });
        });

        it('has right currencies list', function() {
            expect(currenciesStore.currencies).toEqual(['USD', 'RUR', 'EUR', 'GBP', 'AUD']);
        });

        it('has right number of flowCollection items', function() {
            expect(currenciesStore.flowCollection.length).toBe(6);
        });

        it('triggers flows:add event', function() {
            expect(flowCollectionHandler.onAddFlow).toHaveBeenCalled();
        });

        it('flows:add event handler has proper arguments', function() {
            expect(spyFlowsCollection.length).toBe(2);
            expect(spyStoreCollection).toEqual(currenciesStore.flowCollection);
        });

        it('triggers update event', function() {
            expect(updateHandler.onUpdate).toHaveBeenCalled();
        });

        it('flows:add event handler has proper arguments', function() {
            expect(spyBatch).toBe(17);
            expect(spyMessages).toBe(1029);
            expect(spyCountries).toEqual(currenciesStore.countries);
            expect(spyCurrencies).toEqual(currenciesStore.currencies);
            expect(spyFlowsCollectionUpdate).toEqual(currenciesStore.flowCollection);
        });
    });
});
