var rRand = d3.random.normal(.025, .005),
    drRand = d3.random.normal(0, .000025),
    influenceRand = d3.random.logNormal(0,1);

// EXAMPLE 1

d3.csv("data/libor-usd-1week.csv", parseData, function(data) {
  d3.select("#fig1 .time-series")
    .datum(data)
    .call(timeSeriesChart());
});

function parseData(row) {
  var formatDate = d3.time.format("%m/%d/%Y");
  for (var key in row) {
    if (row.hasOwnProperty(key)) {
      if(key=="date") {
        row[key] = formatDate.parse(row[key]);
      } else {
        if(row[key] === "") {
          row[key] = undefined;
        } else {
          row[key] /= 100;
        }
      }
    }
  }
  return row;
}


// EXAMPLE 2

var rates2 = d3.range(16).map(function(d, i) {
  return {
    "name": "Bank " + (i+1),
    "r": rRand(),
    "vr": drRand(),
    "influence": influenceRand()/2000,
    "vrInfluence": 0,
    "captured": false
  };
});

var libor2 = liborChart()
  .capture(true);

var chart2 = d3.select("#fig2")
  .datum(rates2)
  .call(libor2);

// EXAMPLE 3

var rates3 = d3.range(16).map(function(d, i) {
  return {
    "name": "Bank " + (i+1),
    "r": rRand(),
    "vr": drRand(),
    "influence": influenceRand()/2000,
    "vrInfluence": 0,
    "captured": false
  };
});

var libor3 = liborChart()
  .capture(true)
  .influence(true);

var chart3 = d3.select("#fig3")
  .datum(rates3)
  .call(libor3);

d3.timer(function(t) {
  randomWalk(rates3);
  chart3.call(libor3);
  renderSwap(libor3.libor());
});

function randomWalk(rates) {
  rates.forEach(function(d,i) {
    if(d.captured) return;
    d.r += d.vr;
    d.vr += drRand() - 0.2 * d.vr;

    if(d.mouse) {
      d.vr += d.influence * (d.mouse - d.r);
    }
  })
}

// EXAMPLE 4

var percentage = d3.format(".2%");
var dolla = d3.format("$,.0f");

var principal = 1e6;
var fixedRate = .025;

sliderDispatch.on("sliderChange.main", function(value) {
  principal = value;
  d3.select('[data-figure="principal"]').text(dolla(principal));
});
sliderDispatch.sliderChange(principal);

var swapScale = d3.scale.linear()
  .domain([0,50000])
  .range([0,d3.select(".counterparty").node().offsetWidth]);

function renderSwap(floatingRate) {

  d3.select('[data-figure="fixed-rate"]').text(percentage(fixedRate));
  d3.select('[data-figure="floating-rate"]').text(percentage(floatingRate));

  d3.select('[data-figure="fixed-dollar"]').text(dolla(fixedRate*principal));
  d3.select('[data-figure="floating-dollar"]').text(dolla(floatingRate*principal));

  var net = (fixedRate*principal) - (floatingRate*principal);
  var payerSide = net > 0;

  d3.select('[data-figure="net-caption"]').text(payerSide ? "Alice pays Bob" : "Bob pays Alice");
  d3.select('[data-figure="net-figure"]').text(dolla(Math.abs(net)));

  d3.select(".payer .bar").style("width", swapScale(fixedRate*principal)+"px");
  d3.select(".receiver .bar").style("width", swapScale(floatingRate*principal)+"px")
  d3.select(".net .bar")
    .style("width", swapScale(Math.abs(net))+"px")
    .classed("payer", payerSide)
    .classed("receiver", !payerSide);

}


