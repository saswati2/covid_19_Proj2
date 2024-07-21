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
    .attr('transform', (d, i) => `translate(0, ${i * spacing})`)

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
  const yAxisGEnter = gEnter.append('g').attr('class', 'y-axis');

  yAxisG.merge(yAxisGEnter)
    .call(yAxis)
    .selectAll('.domain').remove();

  yAxisGEnter.append('text')
    .attr('class', 'axis-label')
    .attr('y', -80)
    .attr('fill', 'black')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .merge(yAxisG.select('.axis-label'))
    .attr('x', -innerHeight / 2)
    .text(yAxisLabel);

  const xAxisG = g.select('.x-axis');
  const xAxisGEnter = gEnter.append('g').attr('class', 'x-axis');

  xAxisG.merge(xAxisGEnter)
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('.domain').remove();

  xAxisGEnter.append('text')
    .attr('class', 'axis-label')
    .attr('y', 70)
    .attr('fill', 'black')
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth / 2)
    .text(xAxisLabel);

  const trendlines = {
    US: d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d.US))
      .curve(d3.curveBasis),
    India: d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d.India))
      .curve(d3.curveBasis),
    France: d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d.France))
      .curve(d3.curveBasis),
    Germany: d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d.Germany))
      .curve(d3.curveBasis),
    Brazil: d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d.Brazil))
      .curve(d3.curveBasis),
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

  gEnter.append('text')
    .attr('class', 'title')
    .merge(g.select('.title'))
    .attr('y', -10)
    .text(title);

  gEnter.append('text')
    .attr('class', 'parameter')
    .merge(g.select('.parameter'))
    .attr('y', -30)
    .attr('x', innerWidth / 2 - 190)
    .text(parameter);

  const colorLegendG = svg.append('g')
    .attr('transform', `translate(${width - margin.right + 30},${height - innerHeight + 130})`);

  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadiusColorLegend: 10,
    spacing: 30,
    textOffset: 10
  });
};

d3.csv('data/transposed_covid_data.csv').then(data => {
  data.forEach(d => {
    d.Time = new Date(d.Time);
    d.US = +d.US;
    d.Brazil = +d.Brazil;
    d.India = +d.India;
    d.France = +d.France;
    d.Germany = +d.Germany;
  });
  renderScene2('#scene2-svg', data);
});
