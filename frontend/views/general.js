'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var GeneralView = Backbone.View.extend({

    tagName: 'section',

    /**
     * View constructor
     * @param options
     */
    initialize: function (options) {
        this.model.on('update', this.update, this);
    },

    /**
     * Renders view
     * @return GeneralView
     */
    render: function () {
        this.$el.empty();

        this.batchElement = document.createElement('div');
        this.el.appendChild(this.batchElement);

        this.messagesElement = document.createElement('div');
        this.el.appendChild(this.messagesElement);

        this.update();

        return this;
    },

    /**
     * Event occurs when model is updated
     */
    update: function() {
        $(this.batchElement).text('Batch number: ' + formatNumber(this.model.batch));
        $(this.messagesElement).text('Overall messages number: ' + formatNumber(this.model.messages));
    }
});

function formatNumber(number) {
    var re = '\\d(?=(\\d{3})+$)';
    return number.toString(10).replace(new RegExp(re, 'g'), '$&,');
}

module.exports = GeneralView;
