function liborChart() {

  var sel,
      svg,
      margin = {top: 20, right: 20, bottom: 30, left: 20},
      width = 760 - margin.left - margin.right,
      height = 80 - margin.top - margin.bottom;

  var percentage = d3.format(".0%");
  var percentage2 = d3.format(".2%");

  var x = d3.scale.linear()
      .domain([0,.05])
      .range([0,width]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize("10")
      .ticks(innerWidth > 500 ? 10 : 5)
      .tickFormat(percentage2);

  var mouseCapture = false,
      mouseInfluence = false,
      autoScale = false;

  var liborRates,
      liborExtent,
      liborRate;

  function render(selection) {
    sel = selection;
    selection.each(function(rates) {

      // Update width to match container
      width = this.offsetWidth - margin.left - margin.right;
      x.range([0,width]);

      if(autoScale) {
        var ext = d3.extent(rates, ƒ('r'));
        var mid = (ext[0]+ext[1])/2;
        var extExt = ext[1]-ext[0];
        x.domain([mid - extExt*1, mid + extExt*1]);
      }

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([rates]);

      // Otherwise, create the skeletal chart.
      setup(svg.enter(), rates);

      // Update the outer dimensions
      svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

      // Update stuff
      var svgG = svg.select("g.chart-group");

      // Do rates maths
      rates = rates.filter(function(d) { return d.r !== undefined && d.r !== null; });
      rates.sort(function(a,b) { return a.r-b.r; });
      liborRates = rates.slice(Math.round(rates.length*.25),Math.round(rates.length*.75));
      liborExtent = d3.extent(liborRates, ƒ('r'));
      liborRate = liborRates.reduce(function(a, b) { return a + b.r; }, 0) / liborRates.length;

      // Draw things

      d3.transition(svgG).select("line.libor-span")
        .attr("x1", function(d) { return x(liborExtent[0]); })
        .attr("x2", function(d) { return x(liborExtent[1]); });

      d3.transition(svgG).select("g.libor-mark")
        .attr("transform", function(d) { return "translate(" + x(liborRate) + "," + (height+5) + ")"; })
        .select("text").text(percentage2(liborRate));

      // Update bank dots, structurally
      var bankG = svgG.selectAll("g.bank")
        .data(rates, ƒ('name'));
      var bankGEnter = bankG.enter()
        .append("g.bank");
      bankGEnter.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 3);
      bankGEnter.append("text")
        .attr("dy", "-.5em")
        .text(ƒ('name'));
      bankG.exit().remove();
      // Update bank dots styling
      svgG.selectAll("g.bank")
        .classed("captured", ƒ('captured'))
        .classed("accepted", function(d) { return d.r >= liborExtent[0] && d.r <= liborExtent[1]; });
      d3.transition(svgG).selectAll("g.bank")
        .attr("transform", function(d) { return "translate("+x(d.r)+"," + height/2 + ")"; })

      if(autoScale) {
        d3.transition(svgG).select(".x.axis").call(xAxis);
      }

    });
  }

  render.capture = function(_) {
    if (!arguments.length) return mouseCapture;
    mouseCapture = _;
    return render;
  };

  render.influence = function(_) {
    if (!arguments.length) return mouseInfluence;
    mouseInfluence = _;
    return render;
  };

  render.scale = function(_) {
    if (!arguments.length) return autoScale;
    autoScale = _;
    return render;
  };

  render.libor = function() {
    return liborRate;
  }

  function setup(svgEnter, rates) {

    svgEnterG = svgEnter.append("svg")
      .append("g.chart-group")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgEnterG.append('rect')
      .attr('class', 'click-capture')
      .style('visibility', 'hidden')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height+margin.bottom);

    svgEnterG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Rate");

    svgEnterG.append("line.libor-span")
      .attr("y1", height)
      .attr("y2", height);

    var liborMark = svgEnterG.append("g.libor-mark");
    liborMark.append("path")
      .attr("d", d3.svg.symbol().type("triangle-up"));
    liborMark.append("text")
      .attr("dy", "17px");

    if(mouseCapture) {
      svgEnterG.classed("mousey", true);

      svgEnterG.on("mouseenter", onPointStart);
      svgEnterG.on("touchstart", onPointStart);

      function onPointStart() {
        var point = d3.touch(this) || d3.mouse(this);
        rates.filter(function(d,i) { return d.captured; }).forEach(function(d) { d.captured = false; });
        rates.sort(function(a,b) { return a.r-b.r; });
        closest(ƒ('r'))(rates,x.invert(point[0])).captured = true;
        sel.call(render);
      }

      svgEnterG.on("mouseleave", onPointEnd);
      svgEnterG.on("touchend", onPointEnd);

      function onPointEnd() {
        var point = d3.touch(this) || d3.mouse(this);
        rates.filter(function(d,i) { return d.captured; }).forEach(function(d) { d.captured = false; });
        influenceRates(false);
        sel.call(render);
      }

      svgEnterG.on("mousemove", onPointMove);
      svgEnterG.on("touchmove", onPointMove);

      function onPointMove() {
        var point = d3.touch(this) || d3.mouse(this);
        rates.filter(function(d,i) { return d.captured; })[0].r = x.invert(point[0]);
        influenceRates(d3.mouse(this));
        sel.call(render);
      }
    }

    function influenceRates(mouse) {
      if(!mouseInfluence) return;
      if(mouse) {
        rates.forEach(function(d,i) {
          d.mouse = x.invert(mouse[0]);
        })
      } else {
        rates.forEach(function(d,i) {
          d.mouse = false;
        })      
      }
    }

  }

  return render;
}

function closest(accessor) {
  var bi = d3.bisector(accessor).right;
  return function(array, item) {
    var i = bi(array, item);
    var left = array[i-1];
    var right = array[i];

    var dLeft = (left !== undefined) ? Math.abs(accessor(left) - item) : Infinity;
    var dRight = (right !== undefined) ? Math.abs(accessor(right) - item) : Infinity;

    return dLeft <= dRight ? left : right;
  }
}