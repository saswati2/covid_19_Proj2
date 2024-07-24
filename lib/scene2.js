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
  const colorValue = ['Brazil', 'France', 'Germany', 'India', 'US'];
  const transitionDuration = 5000;

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

  const waveAnnotations = [
    { date: new Date('2020-06-24'), label: '2nd wave', country: 'US' },
    { date: new Date('2020-07-24'), label: '2nd wave', country: 'India' },
    { date: new Date('2020-10-27'), label: '2nd wave', country: 'Germany' },
    { date: new Date('2020-10-21'), label: '2nd wave', country: 'France' },
    { date: new Date('2020-11-21'), label: '2nd wave', country: 'Brazil' },
    { date: new Date('2020-11-02'), label: '3rd wave', country: 'US' },
    { date: new Date('2021-04-01'), label: '3rd wave', country: 'India' },
    { date: new Date('2021-03-25'), label: '3rd wave', country: 'Germany' },
    { date: new Date('2020-10-25'), label: '3rd wave', country: 'France' },
    { date: new Date('2021-04-01'), label: '3rd wave', country: 'Brazil' },
    { date: new Date('2021-12-10'), label: '4th wave', country: 'US' },
    { date: new Date('2022-01-01'), label: '4th wave', country: 'India' },
    { date: new Date('2022-01-07'), label: '4th wave', country: 'Germany' },
    { date: new Date('2021-12-19'), label: '4th wave', country: 'France' },
    { date: new Date('2022-01-17'), label: '4th wave', country: 'Brazil' }
  ];

  const waveAnnotationsUnique = Array.from(new Set(waveAnnotations.map(a => a.label)))
    .map(label => {
      return waveAnnotations.find(a => a.label === label);
    });

  waveAnnotationsUnique.forEach(annotation => {
    const annotationX = xScale(annotation.date);
    const annotationY = yScale(data.find(d => d.Time >= annotation.date)[annotation.country]);
    
    g.merge(gEnter).append('text')
      .attr('x', annotationX)
      .attr('y', annotationY - 10)  // Slightly above the curve
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('font-size', '12px')
      .text(annotation.label);

    Object.keys(lineGenerators).forEach(country => {
      const curveX = xScale(data.find(d => d.Time >= annotation.date)[country]);
      const curveY = yScale(data.find(d => d.Time >= annotation.date)[country]);
      
      g.merge(gEnter).append('line')
        .attr('x1', curveX)
        .attr('y1', curveY)
        .attr('x2', annotationX)
        .attr('y2', annotationY)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');
    });
  });

  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadiusColorLegend: 10,
    spacing: 30,
    textOffset: 10
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
