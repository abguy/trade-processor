'use strict';

var GeneralView = require('../../views/general.js');
var CurrenciesStore = require('../../stores/currencies.js');

describe('Test currencies general view.', function() {
    var sectionElement, generalView, currenciesStore;

    beforeEach(function() {
        currenciesStore = new CurrenciesStore({
            "batch": 3,
            "messages": 8
        });

        generalView = new GeneralView({
            model: currenciesStore
        });

        sectionElement = generalView.render().el;
    });

    afterEach(function() {
        sectionElement = null;
    });

    describe("General view", function() {
        it('should be created', function() {
            expect(sectionElement).not.toBeNull();
        });

        it('has right number of children', function() {
            expect(sectionElement.children.length).toBe(2);
        });

        it('has proper children', function() {
            var children = sectionElement.children;
            expect(children[0].innerHTML).toContain(': 3');
            expect(children[1].innerHTML).toContain(': 8');
        });
    });

    describe("An updated general view", function() {

        beforeEach(function() {
            currenciesStore.updateData({
                "batch": 17,
                "messages": 1029
            });
        });

        it('should be created', function() {
            expect(sectionElement).not.toBeNull();
        });

        it('has right number of children', function() {
            expect(sectionElement.children.length).toBe(2);
        });

        it('has proper children', function() {
            var children = sectionElement.children;
            expect(children[0].innerHTML).toContain(': 17');
            expect(children[1].innerHTML).toContain(': 1,029');
        });
    });
});
