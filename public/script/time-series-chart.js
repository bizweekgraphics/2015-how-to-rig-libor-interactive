// from
// http://bost.ocks.org/mike/chart/
// http://bost.ocks.org/mike/chart/time-series-chart.js
// w/ minimal tweaks
// hi mike ilu

function timeSeriesChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      percentage = d3.format(".1%"),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0).ticks(innerWidth > 500 ? 10 : 5),
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
          .domain(d3.extent(data, ƒ('date')))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, ƒ('avg'))])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g.chart-group");
      // gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      // to capture mousemoves
      gEnter.append('rect')
        .attr('class', 'click-capture')
        .style('visibility', 'hidden')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom);

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
          .y(function(d) { return yScale(d[series]); })
          .defined(function(d) { return d[series] !== undefined && d[series] !== null; });
        gEnter.append("path")
          .attr("class", "line")
          .attr("data-bank", series)
          .attr("d", line);
      })

      g.on("mousemove", onPointMove);
      g.on("touchmove", onPointMove);

      function onPointMove(d) {
        var point = d3.touch(this) || d3.mouse(this);
        var mouseX = xScale.invert(point[0]);

        // out of bounds, too low
        if(mouseX < xScale.domain()[0]) return;
        if(mouseX > xScale.domain()[1]) return;

        var bisect = d3.bisector(ƒ('date')).left;
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

        var scrubLine = g.selectAll("line.scrub").data([mouseX]);
        scrubLine.enter().append("line.scrub");
        scrubLine.exit().remove();
        scrubLine
          .attr("x1", xScale(mouseX)).attr("x2", xScale(mouseX))
          .attr("y1", 0).attr("y2", height - margin.top - margin.bottom);

        d3.select("#fig1 .libor-chart")
          .datum(newData)
          .transition()
          .ease("linear")
          .call(liborChart().scale(true));
      }

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
