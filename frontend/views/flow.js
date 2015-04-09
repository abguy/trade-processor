'use strict';

var d3 = require('d3');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var FlowGraph = Backbone.View.extend({

    tagName: 'section',

    /**
     * Graph constructor
     * @param options
     */
    initialize: function (options) {
        this.title = options.title;
        this.width = options.width || 1200;
        this.height = options.height || 500;
        this.numberFormatter = options.numberFormatter || d3.format(",.2f");
        this.collection.on('flows:add', this.onAddFlows, this);
    },

    /**
     * Renders graph
     * @returns {FlowGraph}
     */
    render: function () {
        this.$el.empty();

        if (this.title) {
            var header = document.createElement('h2');
            $(header).text(this.title);
            this.el.appendChild(header);
        }

        this.force = d3.layout.force()
            .gravity(.05)
            .distance(360)
            .size([this.width, this.height])
            .linkDistance(360)
            .charge(-300);
        this.nodes = this.force.nodes();
        this.links = this.force.links();

        var svg = d3.select(this.el).append("svg:svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("pointer-events", "all")
            .attr("viewBox", "0 0 " + this.width + " " + this.height)
            .attr("perserveAspectRatio","xMinYMid");

        svg.append("svg:defs").selectAll("marker")
                .data(["end"])
            .enter().append("svg:marker")
                .attr("id", "end")
                .attr("viewBox", "-10 -5 10 10")
                .attr("refX", -15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
            .append("svg:path")
                .attr("d", "M0,5L-10,0L0,-5");

        this.svg = svg.append('svg:g');

        this.collection.forEach(function(edgeData) {
            this.addEdge(edgeData);
        }, this);

        this.update();
        return this;
    },

    /**
     * Check that node exists or creates a new one
     * @param name
     * @returns Object
     */
    ensureNode: function(name) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (name == this.nodes[i].name) {
                return this.nodes[i];
            }
        }

        var node = {name: name};
        this.nodes.push(node);
        return node;
    },

    /**
     * Adds new edge to the graph
     * @param data
     */
    addEdge: function (data) {
        var edge = {
            source: this.ensureNode(data.get('source')),
            target: this.ensureNode(data.get('target')),
            value: this.numberFormatter(data.get('from')) + ' => ' + this.numberFormatter(data.get('to'))
        };

        for (var i = 0; i < this.links.length; i++) {
            if (edge.source.name == this.links[i].source.name && edge.target.name == this.links[i].target.name) {
                this.svg.selectAll("#label-" + edge.source.name + "-" + edge.target.name)
                    .text(edge.value);
                return;
            }
        }

        this.links.push(edge);
    },

    /**
     * Event occurs when new flows are added to collection.
     * @param flows
     */
    onAddFlows: function(flows) {
        flows.forEach(function(edgeData) {
            this.addEdge(edgeData);
        }, this);

        this.update();
    },

    /**
     * Updates graph view.
     */
    update: function() {
        /**
         * I've found initial code in the Internet, although I have to rework it significantly.
         * Unfortunately it (and source scripts too) does not work in IE properly.
         * Anyway, big thanks for the initial code to:
         *
         * mbostock http://bl.ocks.org/mbostock
         * @see http://bl.ocks.org/mbostock/1153292
         *
         * nrabinowitz http://stackoverflow.com/users/380487/nrabinowitz
         * @see http://stackoverflow.com/questions/18316056/d3-js-force-layout-edge-label-placement-rotation
         *
         * Rahul Rout http://stackoverflow.com/users/1482500/rahul-rout
         * @see http://stackoverflow.com/questions/11400241/updating-links-on-a-force-directed-graph-from-dynamic-json-data
         */
        var link = this.svg.selectAll("path.link").data(this.links);

        link.enter().append("svg:path")
            .attr("class", "link")
            .attr("marker-start", function(d) { return "url(#end)"; });

        link.enter().append("svg:path")
            .attr("id", function(d) { return d.source.name + "-" + d.target.name; })
            .attr("class", "text");

        var linkPath = this.svg.selectAll("path.link").data(this.links);
        var textPath = this.svg.selectAll("path.text").data(this.links);

        var node = this.svg.selectAll("g.node").data(this.nodes);

        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .call(this.force.drag);

        var circle = nodeEnter.append("svg:circle").attr("r", 6);

        var text = nodeEnter.append("svg:g");
        // A copy of the text with a thick white stroke for legibility.
        text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("class", "shadow")
            .text(function(d) { return d.name; });
        text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .text(function(d) { return d.name; });

        var pathLabel = this.svg.selectAll(".path-label")
            .data(this.links)
            .enter().append("svg:text")
                .attr("class", "path-label")
                .append("svg:textPath")
                    .attr("startOffset", "50%")
                    .attr("text-anchor", "middle")
                    .attr("id", function(d) { return "label-" + d.source.name + "-" + d.target.name; })
                    .attr("xlink:href", function(d) { return "#" + d.source.name + "-" + d.target.name; })
                    .style("fill", "#000")
                    .style("font-family", "Arial")
                    .text(function(d) { return d.value; });

        function arcPath(leftHand, d) {
            var start = leftHand ? d.source : d.target,
                end = leftHand ? d.target : d.source,
                dx = end.x - start.x,
                dy = end.y - start.y,
                dr = Math.sqrt(dx * dx + dy * dy),
                sweep = leftHand ? 0 : 1;
            return "M" + start.x + "," + start.y + "A" + dr + "," + dr + " 0 0," + sweep + " " + end.x + "," + end.y;
        }

        // Use elliptical arc path segments to doubly-encode directionality.
        this.force.on("tick", function () {
            linkPath.attr("d", function(d) {
                return arcPath(false, d);
            });

            textPath.attr("d", function(d) {
                return arcPath(d.source.x < d.target.x, d);
            });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        });

        this.force.start();
    }
});

module.exports = FlowGraph;
