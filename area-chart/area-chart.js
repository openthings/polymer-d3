Polymer({
    is: 'area-chart',

    properties: {
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'slice',
                txt: 'Pick a dimension',
                selectedValue: 2,
                uitype: 'single-value',
                tickFormat: 'Tabbrweekday'
            }, {
                input: 'sliceSize',
                txt: 'Pick a messure',
                selectedValue: 1,
                uitype: 'single-value',
                tickFormat: 'number'
            }, {
                input: 'sliceSize',
                txt: 'Pick a group',
                selectedValue: 0,
                uitype: 'single-value',
                tickFormat: 'number'
            }]
        },
        external: Array,
        settings: {
            notify: true,
            type: Array,
            value: []
        },
        source: {
            type: Array,
            value: [],
            notify: true
        }
    },

    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },
    draw: function() {
        var sourceHandle = PolymerD3.fileReader('area.csv',[1],[2],"%m/%d/%y");
        var format = d3.time.format("%m/%d/%y");

        var margin = {
                top: 20,
                right: 30,
                bottom: 30,
                left: 40
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

            var xAxis = PolymerD3.axis('time', 'Tabbrmonth');
            var yAxis = PolymerD3.axis('currency');
        var x = xAxis.scale()
            .range([0, width]);

        var y = yAxis.scale()
            .range([height, 0]);

        var z = d3.scale.category20c();

        //var xAxis = d3.svg.axis()
         //   .scale(x)
            xAxis.orient("bottom")
            .ticks(d3.time.days);

        //var yAxis = d3.svg.axis()
          //  .scale(y)
            yAxis.orient("left");

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d.date;
            })
            .y(function(d) {
                return d.value;
            });

        var nest = d3.nest()
            .key(function(d) {
                return d.key;
            });

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) {
                return x(d.date);
            })
            .y0(function(d) {
                return y(d.y0);
            })
            .y1(function(d) {
                return y(d.y0 + d.y);
            });

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            source = sourceHandle();

            //todo work with source

        d3.csv("area.csv", function(error, data) {
            if (error) throw error;

            data.forEach(function(d) {
                d.date = format.parse(d.date);
                d.value = +d.value;
            });

            var layers = stack(nest.entries(data));

            x.domain(d3.extent(data, function(d) {
                return d.date;
            }));
            y.domain([0, d3.max(data, function(d) {
                return d.y0 + d.y;
            })]);

            svg.selectAll(".layer")
                .data(layers)
                .enter().append("path")
                .attr("class", "layer")
                .attr("d", function(d) {
                    return area(d.values);
                })
                .style("fill", function(d, i) {
                    return z(i);
                });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
        }); //end of csv
    }
});