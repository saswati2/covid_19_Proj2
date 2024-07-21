//const svg = d3.select('svg');

//const width = +svg.attr('width');
//const height = +svg.attr('height');

const width = 1800, height = 780;
let data;

const renderIndexPage = (svgId, data) => {

  const svg = d3.select(svgId).append("svg")
    .attr("width", width)
    .attr("height", height);

  const nested = d3.nest()
    .key(function (d) { return d["Country/Region"]; })
    .rollup(function (d) {
      return {
        latestConfirmedCases: d3.sum(d, function (e) { return e["7/22/20"]; }),
        //country: d3.sum(d, function(e) { return e.line2; })
      };
    })
    .entries(data);

  data = nested.sort((a, b) => d3.descending(+a["value"]["latestConfirmedCases"], +b["value"]["latestConfirmedCases"])).slice(0, 50)

  const xValue = d => d["value"]["latestConfirmedCases"];
  const yValue = d => d["key"];


  const mergin = {
    top: 60, bottom: 85, left: 200, right: 20
  };
  const innerWidth = width - mergin.left - mergin.right;
  const innerHeight = height - mergin.top - mergin.bottom;

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, innerWidth]);



  const yScale = d3.scaleBand()
    .domain(data.map(yValue))
    .range([0, innerHeight])
    .padding(0.11);


  const g = svg.append('g')
    .attr('transform', `translate(${mergin.left},${mergin.top})`);

  const xAxisTickFormat = number => d3.format('.3s')(number).replace('G', 'B');

  const xAxis = d3.axisBottom(xScale).tickFormat(xAxisTickFormat).tickSize(-innerHeight);

  g.append('g').call(d3.axisLeft(yScale))
    .selectAll('.domain,.tick line')
    .remove();
  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);

  xAxisG.selectAll('.domain').remove();

  xAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('y', 70)
    .attr('x', innerWidth / 2)
    .attr('fill', 'black')
    .text('Number of Confirmed Cases as on 7/22/2020');

    const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    //.style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  const mouseover = function (d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style('fill','orange')
  }
  const mousemove = function (d) {
    tooltip
      .html("Total Number of confirmed cases: " + xValue(d))
      .style("left", (d3.mouse(this)[0]) + "px")
      .style("top", (d3.mouse(this)[1] + 270) + "px")
  }
  const mouseleave = function (d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style('fill','steelblue')
  }


  g.selectAll('rect').data(data)
    .enter().append('rect')
    .attr('y', d => yScale(yValue(d)))
    .attr('width', 10)
    .attr('height', 10)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .transition().duration(5000)
    .attr('width', d => xScale(xValue(d)))
    .attr('height', yScale.bandwidth())

  g.append('text')
    .attr('class', 'title')
    .attr('y', -10)
    .text('Top 50 Countries');

};

d3.csv('data/time_series_covid19_confirmed.csv').then(data => {
  renderIndexPage('#index-svg', data);
});
