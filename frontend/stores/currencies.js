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
        if (models.length < 1) {
            return;
        }

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

        this.batch = storeData.batch || 0;
        this.messages = storeData.messages || 0;
        this.currencies = storeData.currencies || [];
        this.countries = storeData.countries || {};

        this.flowCollection = new CurrencyFlowsCollection(storeData.flows || []);
    },

    updateData: function(storeData) {
        storeData = storeData || {};

        this.batch = storeData.batch || this.batch;
        this.messages = storeData.messages || this.messages;
        if (_.has(storeData, 'currencies')) {
            this.currencies = _.uniq(_.union(this.currencies, storeData.currencies));
        }
        _.extend(this.countries, storeData.countries || {});

        this.flowCollection.add(storeData.flows || []);

        this.trigger('update', storeData, this);
    }
});

module.exports = CurrenciesStore;
