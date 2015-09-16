function liborChart() {

  var sel,
      svg,
      margin = {top: 20, right: 20, bottom: 30, left: 20},
      width = 760 - margin.left - margin.right,
      height = 80 - margin.top - margin.bottom;

  var percentage = d3.format(".0%");
  var percentage2 = d3.format(".2%");

  var x = d3.scale.linear()
      .domain([0,.1])
      .range([0,width]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize("10")
      .tickFormat(percentage);

  var mouseCapture = false,
      mouseInfluence = false;

  var liborRates,
      liborExtent,
      liborRate;

  function render(selection) {
    sel = selection;
    selection.each(function(rates) {

      // Update width to match container
      width = this.offsetWidth - margin.left - margin.right;
      x.range([0,width]);

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

      rates.sort(function(a,b) { return a.r-b.r; });
      liborRates = rates.slice(Math.round(rates.length*.25),Math.round(rates.length*.75));
      liborExtent = d3.extent(liborRates, ƒ('r'));
      liborRate = liborRates.reduce(function(a, b) { return a + b.r; }, 0) / liborRates.length;

      svg.selectAll("g.bank")
        .data(rates, ƒ('name'))
        .attr("transform", function(d) { return "translate("+x(d.r)+"," + height/2 + ")"; })
        .classed("captured", ƒ('captured'))
        .classed("accepted", function(d) { return d.r >= liborExtent[0] && d.r <= liborExtent[1]; });

      svg.select("line.libor-span")
        .attr("x1", function(d) { return x(liborExtent[0]); })
        .attr("x2", function(d) { return x(liborExtent[1]); });

      svg.select("g.libor-mark")
        .attr("transform", function(d) { return "translate(" + x(liborRate) + "," + (height+5) + ")"; })
        .select("text").text(percentage2(liborRate));

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

  render.libor = function() {
    return liborRate;
  }

  function setup(svg, rates) {

    svg = svg.append("svg")
      .append("g.chart-group")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('rect')
      .attr('class', 'click-capture')
      .style('visibility', 'hidden')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height+margin.bottom);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Rate");

    var bankG = svg.selectAll("g.bank")
      .data(rates, ƒ('name'))
      .enter()
      .append("g.bank");
    bankG.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 2);
    bankG.append("text")
      .attr("dy", "-.5em")
      .text(ƒ('name'));

    svg.append("line.libor-span")
      .attr("y1", height)
      .attr("y2", height);

    var liborMark = svg.append("g.libor-mark");
    liborMark.append("path")
      .attr("d", d3.svg.symbol().type("triangle-up"));
    liborMark.append("text")
      .attr("dy", "15px");

    if(mouseCapture) {
      svg.classed("mousey", true);

      svg.on("mouseenter", function() {
        rates.filter(function(d,i) { return d.name=="Bank 1"; })[0].captured = true;
        sel.call(render);
      })

      svg.on("mouseleave", function() {
        rates.filter(function(d,i) { return d.name=="Bank 1"; })[0].captured = false;
        influenceRates(false);
        sel.call(render);
      })

      svg.on("mousemove", function() {
        mouse = d3.mouse(this);
        rates.filter(function(d,i) { return d.name=="Bank 1"; })[0].r = x.invert(d3.mouse(this)[0]);
        influenceRates(d3.mouse(this));
        sel.call(render);
      })
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
