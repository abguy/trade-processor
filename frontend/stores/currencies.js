'use strict';

var Backbone = require('backbone');
var _ = require('underscore');

var CurrencyFlow = Backbone.Model.extend({});

var CurrencyFlowsCollection = Backbone.Collection.extend({
    model: CurrencyFlow,

    /**
     * Add a model, or list of models to the set.
     *
     * @param models
     * @param options
     * @returns Backbone.Collection
     */
    add: function(models, options) {
        var modelsCollection = Backbone.Collection.prototype.add.apply(this, arguments);
        this.trigger('flows:add', modelsCollection, this);
        return modelsCollection;
    }
});

var CurrenciesStore = function() {
    this.initialize.apply(this, arguments);
};

_.extend(CurrenciesStore.prototype, Backbone.Events, {
    initialize: function(storeData) {
        storeData = storeData || {};
        this.flowCollection = new CurrencyFlowsCollection(storeData.flows || []);
    }
});

module.exports = CurrenciesStore;
