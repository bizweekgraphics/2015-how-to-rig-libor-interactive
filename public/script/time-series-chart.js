// from
// http://bost.ocks.org/mike/chart/
// http://bost.ocks.org/mike/chart/time-series-chart.js
// w/ minimal tweaks
// hi mike ilu

function timeSeriesChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 30},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      percentage = d3.format(".0%"),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(6, 0).ticks(2).tickFormat(percentage),
      line = d3.svg.line().x(X).y(Y),
      formatDate = d3.time.format("%m/%d/%Y");

  function chart(selection) {
    selection.each(function(data) {

      // Update width to match container
      width = this.offsetWidth;

      // Important to sort for later bisection
      data.sort(function(a,b) { return a.date-b.date; });

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      // data = data.map(function(d, i) {
      //   return [xValue.call(data, d, i), yValue.call(data, d, i)];
      // });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d.date; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d.avg; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      // gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      // to capture mousemoves
      gEnter.append('rect')
        .attr('class', 'click-capture')
        .style('visibility', 'hidden')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height+margin.bottom);

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the line path.
      // g.select(".line")
      //     .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      g.select(".y.axis")
          .attr("transform", "translate(0,0)")
          .call(yAxis);

      // lol toph
      Object.keys(data[0]).forEach(function(series) {
        if(series=="date") return;
        var line = d3.svg.line()
          .x(function(d) { return xScale(d.date); })
          .y(function(d) { return yScale(d[series]); });
        gEnter.append("path")
          .attr("class", "line")
          .attr("d", line);
      })

      g.on("mousemove", function(d) {
        var mouseX = xScale.invert(d3.mouse(this)[0]);
        var bisect = d3.bisector(function(d) { return d.date; }).left;
        var latest = data[bisect(data, mouseX)-1];

        var newData = [];

        for (var key in latest) {
          if (latest.hasOwnProperty(key) && key !== "date" && key !== "avg") {
            newData.push({
              "name": key,
              "r": latest[key]
            })
          }
        }

        d3.select("#example1 .libor-chart")
          .datum(newData)
          .call(liborChart());
      })

    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}
