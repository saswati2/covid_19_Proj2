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



const renderScene3 = (svgId, data) => {

  const svg = d3.select(svgId).append("svg")
    .attr("width", width)
    .attr("height", height);

  //const width = +svg.attr('width');
  //const height = +svg.attr('height');
  const circleRadius = 1;

  const xValue = d => d.Time;
  const xAxisLabel = 'Time';
  const yAxisLabel = 'Number of Deaths';
  const yAxisMinVal = 0;
  const yAxisMaxVal = d3.max(data, d => {
    return Math.max(d.India, d.US, d.Brazil, d.Russia, d.Mexico);
  })

  const mergin = {
    top: 60, bottom: 90, left: 130, right: 230
  };
  const innerWidth = width - mergin.left - mergin.right;
  const innerHeight = height - mergin.top - mergin.bottom;
  const title = '';
  const parameter = 'Deaths';
  const colorValue = ['Mexico', 'Russia', 'India', 'Brazil', 'US'];

  const colorScale = d3.scaleOrdinal();

  colorScale.domain(colorValue)
    .domain(colorScale.domain())
    .range(d3.schemeSpectral[colorScale.domain().length]);



  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xValue))
    //.domain([xAxisMinVal, d3.max(data, xValue)])
    .range([0, innerWidth])
    .nice();

  //console.log(xScale.domain())

  //const yScale = d3.scaleSqrt()
  const yScale = d3.scaleLinear()
    //.domain(d3.extent(data,yValue))
    .domain([yAxisMinVal, yAxisMaxVal])
    .range([innerHeight, 0])
    .nice();

  //const g = d3.select('svg').append('g');

  const g = svg.selectAll('.container').data([null]);

  const colorLegendG = svg.append('g')
    .attr('transform', `translate(${width - mergin.right + 30},${height - innerHeight + 130})`);

  const gEnter = g.enter().append('g').attr('class', 'container');
  gEnter.merge(g)
    .attr('transform', `translate(${mergin.left},${mergin.top})`);


  //const xAxisTickFormat = number => d3.format('.3s')(number).replace('G', 'B');
  const xAxis = d3.axisBottom(xScale)
    //.tickFormat(xAxisTickFormat)
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
    .attr('fill', 'black')
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
    .attr('fill', 'black')
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth / 2)
    .text(xAxisLabel);




  const lineGeneratorIndia = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.India))
    .curve(d3.curveBasis);

  const lineGeneratorUS = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.US));
  // .curve(d3.curveBasis);

  const lineGeneratorRussia = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.Russia))
    .curve(d3.curveBasis);

  const lineGeneratorMexico = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.Mexico))
    .curve(d3.curveBasis);

  const lineGeneratorBrazil = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.Brazil))
    .curve(d3.curveBasis);

  g.merge(gEnter).append('path')
    //.data(data)
    .attr('class', 'line-pathUS')
    .attr('stroke', colorScale(colorValue[4]))
    .attr('d', lineGeneratorUS(data));


  g.merge(gEnter).append('path')
    .attr('class', 'line-pathIndia')
    .attr('stroke', colorScale(colorValue[2]))
    .attr('d', lineGeneratorIndia(data));


  g.merge(gEnter).append('path')
    .attr('class', 'line-pathRussia')
    .attr('stroke', colorScale(colorValue[1]))
    .attr('d', lineGeneratorRussia(data));


  g.merge(gEnter).append('path')
    .attr('class', 'line-pathMexico')
    .attr('stroke', colorScale(colorValue[0]))
    .attr('d', lineGeneratorMexico(data));


  g.merge(gEnter).append('path')
    .attr('class', 'line-pathBrazil')
    .attr('stroke', colorScale(colorValue[3]))
    .attr('d', lineGeneratorBrazil(data));


  


  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadiusColorLegend: 10,
    spacing: 30,
    textOffset: 10
  });

};

d3.csv('data/transposed_covid_death.csv').then(data => {
  data.forEach(d => {
    d.Time = new Date(d.Time);
    d.US = +d.US;
    d.Brazil = +d.Brazil;
    d.India = +d.India;
    d.Mexico = +d.Mexico;
    d.Russia = +d.Russia;
  });
  //render(data);
  renderScene3('#scene3-svg',data)
});
