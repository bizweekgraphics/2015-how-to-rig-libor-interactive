var rRand = d3.random.normal(.05, .01),
    drRand = d3.random.normal(0, .00005),
    influenceRand = d3.random.logNormal(0,1);

// EXAMPLE 1

d3.csv("data/libor-usd-1week.csv", parseData, function(data) {
  console.log(data);
  d3.select("#example1 .time-series")
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

var chart2 = d3.select("#example2")
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

var chart3 = d3.select("#example3")
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

function renderSwap(floatingRate) {
  var percentage2 = d3.format(".2%");
  var dolla = d3.format("$,.0f");

  var principal = 12000000;
  var fixedRate = .05;

  d3.select("#fixed-interest-rate").text(percentage2(fixedRate));
  d3.select("#floating-interest-rate").text(percentage2(floatingRate));

  d3.select("#fixed-interest-dollar").text(dolla(fixedRate*principal));
  d3.select("#floating-interest-dollar").text(dolla(floatingRate*principal));

  var net = (fixedRate*principal) - (floatingRate*principal);

  d3.select("#net-outcome").text((net > 0 ? "You receive " : "You pay ") + dolla(Math.abs(net)))

}


