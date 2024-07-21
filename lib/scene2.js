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

  console.log(data);

  const xValue = d => d.Time;
  const yAxisLabel = 'Number of Confirmed Cases';
  const yAxisMinVal = 0;
  const yAxisMaxVal = d3.max(data, d => Math.max(d.US, d.India, d.France, d.Germany, d.Brazil));

  const mergin = {
    top: 60, bottom: 90, left: 130, right: 230
  };
  const innerWidth = width - mergin.left - mergin.right;
  const innerHeight = height - mergin.top - mergin.bottom;
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

  const colorLegendG = svg.append('g')
    .attr('transform', `translate(${width - mergin.right + 30},${height - innerHeight + 130})`);

  const gEnter = g.enter().append('g').attr('class', 'container');
  gEnter.merge(g)
    .attr('transform', `translate(${mergin.left},${mergin.top})`);

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15)
    .ticks(7);

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(5).ticks(7);

  const yAxisG = g.select('.y-axis');
  const yAxisGEnter = gEnter
    .append('g')
    .attr('class', 'y-axis');

  yAxisG.merge(yAxisGEnter)
    .call(yAxis)
    .selectAll('.domain').remove();

  const xAxisG = g.select('.x-axis');
  const xAxisGEnter = gEnter
    .append('g')
    .attr('class', 'x-axis');

  xAxisG.merge(xAxisGEnter)
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('.domain').remove();

  const trendlines = [
    { key: 'US', curve: d3.curveBasis },
    { key: 'India', curve: d3.curveBasis },
    { key: 'France', curve: d3.curveBasis },
    { key: 'Germany', curve: d3.curveBasis },
    { key: 'Brazil', curve: d3.curveBasis }
  ];

  trendlines.forEach((trend, index) => {
    const lineGenerator = d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(d[trend.key]))
      .curve(trend.curve);

    g.merge(gEnter).append('path')
      .attr('class', `line-${trend.key}`)
      .attr('stroke', colorScale(trend.key))
      .attr('d', lineGenerator(data))
      .attr('opacity', 0)
      .transition().duration(transitionDuration * (index + 1))
      .attr('opacity', 1);
  });

  // Handle points and annotations here as needed
  // Note: Make sure the points you're referencing actually exist in the data
  
  const checkNaN = (d, key) => {
    if (isNaN(d[key])) {
      console.log(`NaN detected in ${key} for date ${d.Time}`);
      return false;
    }
    return true;
  };

  const validData = data.filter(d => 
    checkNaN(d, 'US') &&
    checkNaN(d, 'India') &&
    checkNaN(d, 'France') &&
    checkNaN(d, 'Germany') &&
    checkNaN(d, 'Brazil')
  );

  console.log(validData);

  // Handle points and annotations with validData instead of data if necessary
  // ...
  
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
