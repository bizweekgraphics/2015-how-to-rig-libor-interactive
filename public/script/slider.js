// http://bl.ocks.org/shancarter/5979700

var sliderDispatch = d3.dispatch("sliderChange");

!(function() {

  var width = d3.select(".slider").node().offsetWidth;

  var x = d3.scale.linear()
      .domain([1, 2e6])
      .range([0, width])
      .clamp(true);

  var slider = d3.select(".slider")
      .style("width", width + "px");

  var sliderTray = slider.append("div")
      .attr("class", "slider-tray");

  var sliderHandle = slider.append("div")
      .attr("class", "slider-handle");

  sliderHandle.append("div")
      .attr("class", "slider-handle-icon")

  slider.call(d3.behavior.drag()
      .on("dragstart", function() {
        sliderDispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
        d3.event.sourceEvent.preventDefault();
        sliderHandle.select(".slider-handle-icon").classed("active", true);
      })
      .on("drag", function() {
        sliderDispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
      })
      .on("dragend", function() {
        console.log("hi toph");
        sliderHandle.select(".slider-handle-icon").classed("active", false);
      }));

  sliderDispatch.on("sliderChange.slider", function(value) {
    sliderHandle.style("left", x(value) + "px")
  });

})();