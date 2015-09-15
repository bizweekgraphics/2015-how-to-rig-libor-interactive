var svg = d3.select("svg#gamey");

var margin = {top: 20, right: 20, bottom: 30, left: 20},
    width = svg.node().offsetWidth - margin.left - margin.right,
    height = 80 - margin.top - margin.bottom;

svg = svg
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append('rect')
  .attr('class', 'click-capture')
  .style('visibility', 'hidden')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('height', height+margin.bottom);

///
var mouse = false;
var percentage = d3.format(".0%");
var percentage2 = d3.format(".2%");

var numberOfBanks = 16,
    liborLowPass = 4,
    liborHighPass = 12;

var rRand = d3.random.normal(.05, .01),
    drRand = d3.random.normal(0, .00005),
    influenceRand = d3.random.logNormal(0,1);

var rates = d3.range(numberOfBanks).map(function(d, i) {
  return {
    "name": "Bank " + (i+1),
    "r": rRand(),
    "vr": drRand(),
    "influence": influenceRand()/2000,
    "captured": false
  };
})

var x = d3.scale.linear()
  .domain([0,.1])
  .range([0,width])

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize("10")
    .tickFormat(percentage);

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

var liborSpan = svg.append("line.libor-span")
  .attr("y1", height)
  .attr("y2", height);
var liborMark = svg.append("g.libor-mark");
liborMark.append("path")
  .attr("d", d3.svg.symbol().type("triangle-up"));
liborMark.append("text")
  .attr("dy", "15px");

d3.timer(function(t) {

  rates.forEach(function(d,i) {
    if(d.captured) return;
    d.r += d.vr;
    d.vr += drRand() - 0.2 * d.vr;

    if(mouse) {
      d.vr += d.influence * (x.invert(mouse[0]) - d.r);
    }
  })
  rates.sort(function(a,b) {
    return a.r-b.r;
  });

  var liborRates = rates.slice(liborLowPass,liborHighPass);
  var liborExtent = d3.extent(liborRates, ƒ('r'));
  var liborRate = liborRates.reduce(function(a, b) { return a + b.r; }, 0) / liborRates.length;

  bankG
    .attr("transform", function(d) { return "translate("+x(d.r)+"," + height/2 + ")"; })
    .classed("captured", ƒ('captured'))
    .classed("accepted", function(d) { return d.r >= liborExtent[0] && d.r <= liborExtent[1]; });

  liborMark
    .attr("transform", function(d) { return "translate(" + x(liborRate) + "," + (height+5) + ")"; })
    .select("text").text(percentage2(liborRate));

  liborSpan
    .attr("x1", function(d) { return x(liborExtent[0]); })
    .attr("x2", function(d) { return x(liborExtent[1]); })

});

svg.on("mouseenter", function() {
  mouse = d3.mouse(this);
  rates.filter(function(d,i) { return d.name=="Bank 1"; })[0].captured = true;
})

svg.on("mouseleave", function() {
  mouse = false;
  rates.filter(function(d,i) { return d.name=="Bank 1"; })[0].captured = false;
})

svg.on("mousemove", function() {
  mouse = d3.mouse(this);
  rates.filter(function(d,i) { return d.name=="Bank 1"; })[0].r = x.invert(d3.mouse(this)[0]);
})
