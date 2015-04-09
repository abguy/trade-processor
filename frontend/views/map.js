'use strict';

var $ = require('jquery');
global.d3 = require('d3');
global.topojson = require('topojson');
var Datamap = require('datamaps/dist/datamaps.world.js');
var Backbone = require('backbone');
Backbone.$ = $;

if (typeof(Datamap) !== "function") {
    Datamap = window.Datamap;
}

var MapView = Backbone.View.extend({

    tagName: 'section',

    /**
     * View constructor
     * @param options
     */
    initialize: function (options) {
        this.title = options.title;
        this.width = options.width || 1200;
        this.height = options.height || 500;
        this.numberFormatter = options.numberFormatter || d3.format(',');
    },

    /**
     * Renders graph
     * @returns {FlowGraph}
     */
    render: function () {
        this.$el.empty();

        this.el.style.position = 'relative';
        this.$el.width(this.width);
        this.$el.height(this.height);

        if (this.title) {
            var header = document.createElement('h2');
            $(header).text(this.title);
            this.el.appendChild(header);
        }

        this.map = new Datamap({
            element: this.el,
            width: this.width,
            height: this.height,
            data: {},
            geographyConfig: {
                popupTemplate: function (geo, data) {
                    var country = geo.id.substring(0, 2);
                    var number = (country in this.model.countries)
                        ? this.model.countries[country]
                        : 0;

                    var label =
                        '<div class="hoverinfo"><strong>' +
                            geo.properties.name + ': ' + this.numberFormatter(number) +
                        '</strong></div>';

                    return label;
                }.bind(this)
            }
        });

        return this;
    }
});

module.exports = MapView;
