'use strict';

var jsdom = require('jsdom').jsdom;
global.document = jsdom('<html><body></body></html>');
global.window = global.document.parentWindow;

var d3 = require('d3');

var FlowGraph = require('../../views/flow.js');
var CurrenciesStore = require('../../stores/currencies.js');

describe('Test currencies flow graph.', function() {
    var flowGraph, currenciesStore, svg;

    beforeEach(function() {
        currenciesStore = new CurrenciesStore({
            'flows': [
                {source: "EUR", target: "GBP", from: 1000, to: 747.10},
                {source: "GBP", target: "EUR", from: 747.10, to: 1000},
                {source: "RUR", target: "EUR", from: 64.14, to: 1},
                {source: "USD", target: "RUR", from: 100, to: 5926.10}
            ]
        });

        flowGraph = new FlowGraph({
            collection: currenciesStore.flowCollection,
            title: 'Currencies flow graph',
            width: 300,
            height: 200
        });

        svg = d3.select(flowGraph.render().el).select('svg');
    });

    afterEach(function() {
        svg.remove();
    });

    describe("A flow graph", function() {
        it('should be created', function() {
            expect(svg).not.toBeNull();
        });

        it('has right dimensions', function() {
            expect(svg.attr('width')).toBe('300');
            expect(svg.attr('height')).toBe('200');
        });

        it('has right number of vertices', function() {
            expect(svg.selectAll('g.node').size()).toBe(4);
        });

        it('has right number of edges', function() {
            expect(svg.selectAll('path.link').size()).toBe(4);
        });

        it('has edge from EUR to GBP', function() {
            expect(svg.selectAll('path[id="EUR-GBP"]').size()).toBe(1);
        });

        it('has right title from EUR to GBP', function() {
            expect(svg.selectAll('textpath[id="label-EUR-GBP"]').text()).toBe('1,000.00 => 747.10');
        });

        it('has edge from GBP to EUR', function() {
            expect(svg.selectAll('path[id="GBP-EUR"]').size()).toBe(1);
        });

        it('has edge from RUR to EUR', function() {
            expect(svg.selectAll('path[id="RUR-EUR"]').size()).toBe(1);
        });

        it('has right title from RUR to EUR', function() {
            expect(svg.selectAll('textpath[id="label-RUR-EUR"]').text()).toBe('64.14 => 1.00');
        });

        it('has no edge from EUR to RUR', function() {
            expect(svg.selectAll('path[id="EUR-RUR"]').size()).toBe(0);
        });

        it('has edge from USD to RUR', function() {
            expect(svg.selectAll('path[id="USD-RUR"]').size()).toBe(1);
        });

        it('has no edge from RUR to USD', function() {
            expect(svg.selectAll('path[id="RUR-USD"]').size()).toBe(0);
        });

        it('has no edge from RUR to GBP', function() {
            expect(svg.selectAll('path[id="RUR-GBP"]').size()).toBe(0);
        });

        it('has right number of vertices titles', function() {
            expect(svg.selectAll('text.shadow').size()).toBe(4);
        });

        it('has right number of edges titles', function() {
            expect(svg.selectAll('text.path-label').size()).toBe(4);
        });
    });

    describe("An updated flow graph", function() {

        beforeEach(function() {
            currenciesStore.flowCollection.add([
                {source: "AUD", target: "USD", from: "1000", to: "777.53"},
                {source: "RUR", target: "EUR", from: "6414", to: "100"}
            ]);
        });

        it('should be created', function() {
            expect(svg).not.toBeNull();
        });

        it('has right dimensions', function() {
            expect(svg.attr('width')).toBe('300');
            expect(svg.attr('height')).toBe('200');
        });

        it('has right number of vertices', function() {
            expect(svg.selectAll('g.node').size()).toBe(5);
        });

        it('has right number of edges', function() {
            expect(svg.selectAll('path.link').size()).toBe(5);
        });

        it('has edge from EUR to GBP', function() {
            expect(svg.selectAll('path[id="EUR-GBP"]').size()).toBe(1);
        });

        it('has right title from EUR to GBP', function() {
            expect(svg.selectAll('textpath[id="label-EUR-GBP"]').text()).toBe('1,000.00 => 747.10');
        });

        it('has edge from GBP to EUR', function() {
            expect(svg.selectAll('path[id="GBP-EUR"]').size()).toBe(1);
        });

        it('has edge from RUR to EUR', function() {
            expect(svg.selectAll('path[id="RUR-EUR"]').size()).toBe(1);
        });

        it('has right title from RUR to EUR', function() {
            expect(svg.selectAll('textpath[id="label-RUR-EUR"]').text()).toBe('6,414.00 => 100.00');
        });

        it('has no edge from EUR to RUR', function() {
            expect(svg.selectAll('path[id="EUR-RUR"]').size()).toBe(0);
        });

        it('has edge from USD to RUR', function() {
            expect(svg.selectAll('path[id="USD-RUR"]').size()).toBe(1);
        });

        it('has no edge from RUR to USD', function() {
            expect(svg.selectAll('path[id="RUR-USD"]').size()).toBe(0);
        });

        it('has no edge from RUR to GBP', function() {
            expect(svg.selectAll('path[id="RUR-GBP"]').size()).toBe(0);
        });

        it('has edge from AUD to USD', function() {
            expect(svg.selectAll('path[id="AUD-USD"]').size()).toBe(1);
        });

        it('has right title from AUD to USD', function() {
            expect(svg.selectAll('textpath[id="label-AUD-USD"]').text()).toBe('1,000.00 => 777.53');
        });

        it('has right number of vertices titles', function() {
            expect(svg.selectAll('text.shadow').size()).toBe(5);
        });

        it('has right number of edges titles', function() {
            expect(svg.selectAll('text.path-label').size()).toBe(5);
        });
    });
});