const width = 1800, height = 780; 
let data;

const colorLegend = (selection, props) => {
  const {
    colorScale,
    circleRadiusColorLegend,
    spacing,
    textOffset
  } = props;

  const groups = selection.selectAll('g')
    .data(colorScale.domain().reverse());
  const groupsEnter = groups.enter()
    .append('g')
    .attr('class', 'tick');
  groupsEnter.merge(groups)
    .attr('transform', (d, i) => `translate(0, ${i * spacing})`);

  groups.exit().remove();

  groupsEnter.append('circle')
    .merge(groups.select('circle'))
    .attr('r', circleRadiusColorLegend)
    .attr('fill', colorScale);

  groupsEnter.append('text')
    .merge(groups.select('text'))
    .text(d => d)
    .attr('dy', '0.32em')
    .attr('x', textOffset);
};

const renderScene2 = (svgId, data) => {

  const svg = d3.select(svgId).append("svg")
    .attr("width", width)
    .attr("height", height);

  const circleRadius = 1;

  const xValue = d => d.Time;
  const xAxisLabel = 'Time';
  const yAxisLabel = 'Number of Confirmed Cases';
  const yAxisMinVal = 0;
  const yAxisMaxVal = d3.max(data, d => {
    return Math.max(d.US, d.India, d.France, d.Germany, d.Brazil);
  });

  const margin = {
    top: 60, bottom: 90, left: 130, right: 230
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const title = '';
  const parameter = 'Confirmed Cases';
  const colorValue = ['US', 'France', 'India', 'Brazil', 'Germany'];
  const transitionDuration = 100;

  const colorScale = d3.scaleOrdinal()
    .domain(colorValue)
    .range(d3.schemeSpectral[colorValue.length]);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([yAxisMinVal, yAxisMaxVal])
    .range([innerHeight, 0])
    .nice();

  const g = svg.selectAll('.container').data([null]);
  const gEnter = g.enter().append('g').attr('class', 'container');
  gEnter.merge(g)
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15)
    .ticks(7);

  const yAxisTickFormat = number => d3.format('.2s')(number).replace('G', 'B');
  const yAxis = d3.axisLeft(yScale).tickFormat(yAxisTickFormat).tickSize(-innerWidth).tickPadding(5).ticks(7);

  const yAxisG = g.select('.y-axis');
  const yAxisGEnter = gEnter
    .append('g')
    .attr('class', 'y-axis');

  yAxisG.merge(yAxisGEnter)
    .call(yAxis)
    .selectAll('.domain').remove();

  yAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -80)
    .attr('fill', 'black')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .merge(yAxisG.select('.axis-label'))
    .attr('x', -innerHeight / 2)
    .text(yAxisLabel);

  const xAxisG = g.select('.x-axis');
  const xAxisGEnter = gEnter
    .append('g')
    .attr('class', 'x-axis');

  xAxisG.merge(xAxisGEnter)
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('.domain').remove();

  xAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', 70)
    .attr('fill', 'black')
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth / 2)
    .text(xAxisLabel);

  const createTrendline = (country, color) => {
    return d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d[country]))
      .curve(d3.curveBasis);
  };

  const trendlines = {
    US: createTrendline('US', colorScale('US')),
    India: createTrendline('India', colorScale('India')),
    France: createTrendline('France', colorScale('France')),
    Germany: createTrendline('Germany', colorScale('Germany')),
    Brazil: createTrendline('Brazil', colorScale('Brazil')),
  };

  Object.keys(trendlines).forEach((country, index) => {
    g.merge(gEnter).append('path')
      .attr('class', `line-${country}`)
      .attr('stroke', colorScale(country))
      .attr('d', trendlines[country](data))
      .attr('opacity', 0)
      .transition().duration(transitionDuration * (index + 1))
      .attr('opacity', 1);
  });

  const pointOnLine = g.merge(gEnter).selectAll(".dot")
    .data(data.filter((d, i) => i === 151));

  const addAnnotations = (line, cx, cy, x2, y2, text) => {
    pointOnLine.enter().append("circle")
      .attr("class", "dot")
      .attr("cx", line.x())
      .attr("cy", line.y())
      .attr("r", 3.5)
      .attr('opacity', 0)
      .transition().duration(transitionDuration)
      .attr('opacity', 1);

    pointOnLine.enter().append("circle")
      .attr("class", "dot")
      .attr("cx", line.x())
      .attr("cy", line.y())
      .attr("r", 11)
      .attr('opacity', 0)
      .transition().duration(transitionDuration)
      .attr('opacity', 0.3);

    pointOnLine.enter().append("line")
      .attr("class", "dot")
      .style("stroke", "black")
      .attr("x1", line.x())
      .attr("y1", line.y())
      .attr("x2", x2)
      .attr("y2", y2)
      .attr('opacity', 0)
      .transition().duration(transitionDuration)
      .attr('opacity', 1);

    pointOnLine.enter().append("rect")
      .attr('transform', `translate(${x2 - 200},${y2 - 50})`)
      .attr('class', 'rect-tooltip')
      .attr('width', 200)
      .attr('height', 50)
      .attr('opacity', 0.1)
      .attr('opacity', 0)
      .transition().duration(transitionDuration)
      .attr('opacity', 0.1);

    pointOnLine.enter().append("text")
      .attr('transform', `translate(${x2 - 200},${y2 - 30})`)
      .text(text)
      .attr('class', 'annotation-text')
      .attr('fill', 'black')
      .attr('opacity', 0)
      .transition().duration(transitionDuration)
      .attr('opacity', 1);
  };

  addAnnotations(trendlines.US, US_trendline.x(), US_trendline.y(), 1050, 240, "Starting of Second Wave");
  addAnnotations(trendlines.Brazil, Brazil_trendline.x(), Brazil_trendline.y(), 950, 330, "Still into First Wave");
  addAnnotations(trendlines.India, India_trendline.x(), India_trendline.y(), 950, 330, "Annotation for India");
  addAnnotations(trendlines.France, France_trendline.x(), France_trendline.y(), 950, 330, "Annotation for France");
  addAnnotations(trendlines.Germany, Germany_trendline.x(), Germany_trendline.y(), 850, 430, "Flattening the First Wave");

  gEnter
    .append('text')
    .attr('class', 'title')
    .merge(g.select('.title'))
    .attr('y', -10)
    .text(title);

  gEnter
    .append('text')
    .attr('class', 'parameter')
    .merge(g.select('.parameter'))
    .attr('y', -30)
    .attr('x', innerWidth / 2 - 100)
    .attr('fill', 'black')
    .text(parameter);

  svg.append('g')
    .attr('transform', `translate(${width - margin.right + 40},${margin.top})`)
    .call(colorLegend, {
      colorScale,
      circleRadiusColorLegend: 7,
      spacing: 50,
      textOffset: 15
    });
};

// Load and process data
d3.csv("data/transposed_covid_data.csv").then(rawData => {
  data = rawData.map(d => ({
    Time: new Date(d.Time),
    US: +d.US,
    India: +d.India,
    France: +d.France,
    Germany: +d.Germany,
    Brazil: +d.Brazil
  })).filter(d => 
    !isNaN(d.Time) && !isNaN(d.US) && !isNaN(d.India) && !isNaN(d.France) && !isNaN(d.Germany) && !isNaN(d.Brazil)
  );

  renderScene2("#scene2", data);
});
