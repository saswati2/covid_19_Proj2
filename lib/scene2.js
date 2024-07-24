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

  const tooltip = d3.select(svgId).append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("padding", "8px")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("border-radius", "4px")
    .style("color", "#fff");

  const circleRadius = 1;

  const xValue = d => d.Time;
  const xAxisLabel = 'Time';
  const yAxisLabel = 'Number of Confirmed Cases';
  const yAxisMinVal = 0;
  const yAxisMaxVal = d3.max(data, d => {
    return Math.max(d.Brazil, d.France, d.Germany, d.India, d.US);
  });

  const margin = {
    top: 60, bottom: 90, left: 130, right: 230
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const title = '';
  const parameter = 'Confirmed Cases';
  const colorValue = ['Brazil', 'France','Germany', 'India', 'US'];
  const transitionDuration = 50600;

  const colorScale = d3.scaleOrdinal()
    .domain(colorValue)
    .range(['green', 'orange', 'purple', 'blue', 'red']);  

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
    .attr('transform', `translate(${width - margin.right + 30},${height - innerHeight + 130})`);

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

  yAxisLabelText = yAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -80)
    .attr('transform', `rotate(-90)`)
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

  xAxisLabelText = xAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', 70)
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth / 2)
    .text(xAxisLabel);

  const lineGenerators = {
    US: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.US)).curve(d3.curveBasis),
    India: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.India)).curve(d3.curveBasis),
    France: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.France)).curve(d3.curveBasis),
    Germany: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.Germany)).curve(d3.curveBasis),
    Brazil: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.Brazil)).curve(d3.curveBasis),
  };

  Object.keys(lineGenerators).forEach((country, i) => {
    g.merge(gEnter).append('path')
      .attr('class', `line-path-${country}`)
      .attr('stroke', colorScale(country))
      .attr('stroke-width', 3)  // Thicker lines
      .attr('fill', 'none')
      .attr('d', lineGenerators[country](data))
      .attr('opacity', 0.7)
      .style('mix-blend-mode', 'multiply')
      .on('mouseover', function(event, d) {
        tooltip.style("visibility", "visible");
      })
      .on('mousemove', function(event, d) {
        const [x, y] = d3.mouse(this);
        const date = xScale.invert(x);
        const closestData = data.reduce((prev, curr) =>
          Math.abs(curr.Time - date) < Math.abs(prev.Time - date) ? curr : prev);
        tooltip.html(`${country}<br>Time: ${closestData.Time.toLocaleDateString()}<br>Cases: ${closestData[country]}`)
          .style("left", `${d3.event.pageX + 10}px`)
          .style("top", `${d3.event.pageY - 20}px`);
      })
      .on('mouseout', function(event, d) {
        tooltip.style("visibility", "hidden");
      })
      .transition().duration(transitionDuration * (i + 1))
      .attr('opacity', 0.7);
  });

  const waveAnnotations = [
    { date: new Date('2020-06-24'), countries: ['US'], label: 'Starting of 2nd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2020-07-24'), countries: ['India'], label: 'Starting of 2nd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2020-10-27'), countries: ['Germany'], label: 'Starting of 2nd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2020-10-21'), countries: ['France'], label: 'Starting of 2nd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2020-11-21'), countries: ['Brazil'], label: 'Starting of 2nd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2020-11-02'), countries: ['US'], label: 'Starting of 3rd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2021-04-01'), countries: ['India'], label: 'Starting of 3rd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2021-03-25'), countries: ['Germany'], label: 'Starting of 3rd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2020-10-25'), countries: ['France'], label: 'Starting of 3rd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2021-04-01'), countries: ['Brazil'], label: 'Starting of 3rd wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2021-12-10'), countries: ['US'], label: 'Starting of 4th wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2022-01-01'), countries: ['India'], label: 'Starting of 4th wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2022-01-07'), countries: ['Germany'], label: 'Starting of 4th wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2021-12-19'), countries: ['France'], label: 'Starting of 4th wave', xOffset: 50, yOffset: -80 },
    { date: new Date('2022-01-17'), countries: ['Brazil'], label: 'Starting of 4th wave', xOffset: 50, yOffset: -80 }
  ];

  const waveAnnotationsGrouped = d3.nest()
    .key(d => d.label)
    .entries(waveAnnotations);

  waveAnnotationsGrouped.forEach(group => {
    const annotationPoints = group.values.map(d => ({
      x: xScale(d.date),
      y: yScale(data.find(p => p.Time.getTime() === d.date.getTime())[d.countries[0]])
    }));

    const annotationX = d3.mean(annotationPoints, d => d.x);
    const annotationY = d3.mean(annotationPoints, d => d.y) - 20;

    group.values.forEach(d => {
      gEnter.merge(g).append('line')
        .attr('x1', xScale(d.date))
        .attr('y1', yScale(data.find(p => p.Time.getTime() === d.date.getTime())[d.countries[0]]))
        .attr('x2', annotationX)
        .attr('y2', annotationY)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    });

    gEnter.merge(g).append('text')
      .attr('x', annotationX)
      .attr('y', annotationY)
      .attr('text-anchor', 'middle')
      .attr('class', 'annotation')
      .style('font-size', '12px')
      .style('background-color', 'white')
      .text(group.key);
  });

  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadiusColorLegend: 7,
    spacing: 25,
    textOffset: 15
  });
};

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

  renderScene2("#scene2-svg", data);
});
