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

//const width = +svg.attr('width');
//const height = +svg.attr('height');

console.log(data);
const circleRadius = 1;

  const xValue = d => d.Time;
  const xAxisLabel = 'Time';
  const yAxisLabel = 'Number of Confirmed Cases';
  const yAxisMinVal = 0;
  const yAxisMaxVal = d3.max(data, d => {
    return Math.max(d.US, d.India, d.France, d.Gernamy, d.Brazil);
  })

  const mergin = {
    top: 60, bottom: 90, left: 130, right: 230
  };
  const innerWidth = width - mergin.left - mergin.right;
  const innerHeight = height - mergin.top - mergin.bottom;
  const title = '';
  const parameter = 'Confirmed Cases';
  const colorValue = ['US', 'France', 'India', 'Brazil', 'Germany'];
  const transitionDuration = 100;



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

  xAxisLabelText = xAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', 70)
    .attr('fill', 'black')
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth / 2)
    .text(xAxisLabel);




  const India_trendline = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.India))
    .curve(d3.curveBasis);

  const US_trendline = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.US));
  // .curve(d3.curveBasis);

  const France_trendline = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.France))
    .curve(d3.curveBasis);

  const Germany_trendline = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.Germany))
    .curve(d3.curveBasis);

  const Brazil_trendline = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(d.Brazil))
    .curve(d3.curveBasis);

  g.merge(gEnter).append('path')
    //.data(data)
    .attr('class', 'line-US')
    .attr('stroke', colorScale(colorValue[4]))
    .attr('d', US_trendline(data))
    .attr('opacity',0)
    .transition().duration(transitionDuration)
    .attr('opacity',1);



  g.merge(gEnter).append('path')
    .attr('class', 'line-India')
    .attr('stroke', colorScale(colorValue[2]))
    .attr('d', India_trendline(data))
    .attr('opacity',0)
    .transition().duration(transitionDuration*3)
    .attr('opacity',1);


  g.merge(gEnter).append('path')
    .attr('class', 'line-France')
    .attr('stroke', colorScale(colorValue[0]))
    .attr('d', France_trendline(data))
    .attr('opacity',0)
    .transition().duration(transitionDuration*4)
    .attr('opacity',1);
  
  g.merge(gEnter).append('path')
    .attr('class', 'line-Germany')
    .attr('stroke', colorScale(colorValue[1]))
    .attr('d', Germany_trendline(data))
    .attr('opacity',0)
    .transition().duration(transitionDuration*5)
    .attr('opacity',1);

  g.merge(gEnter).append('path')
    .attr('class', 'line-Brazil')
    .attr('stroke', colorScale(colorValue[3]))
    .attr('d', Brazil_trendline(data))
    .attr('opacity',0)
    .transition().duration(transitionDuration*2)
    .attr('opacity',1);


  const pointOnLine = g.merge(gEnter).selectAll(".dot")
    .data(data.filter(function (d, i) { return i === 151 }));

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", US_trendline.x())
    .attr("cy", US_trendline.y())
    .attr("r", 3.5)
    .attr('opacity',0)
    .transition().duration(transitionDuration)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", US_trendline.x())
    .attr("cy", US_trendline.y())
    .attr("r", 11)
    .attr('opacity',0)
    .transition().duration(transitionDuration)
    .attr('opacity', 0.3);

  pointOnLine
    .enter().append("line")
    .attr("class", "dot")
    .style("stroke", "black")
    .attr("x1", US_trendline.x())
    .attr("y1", US_trendline.y())
    .attr("x2", 1050)
    .attr("y2", 240)
    .attr('opacity',0)
    .transition().duration(transitionDuration)
    .attr('opacity',1);

  pointOnLine
    .enter().append("rect")
    .attr('transform', `translate(${1050 - 200},${240 - 50})`)
    .attr('class', 'rect-tooltip')
    .attr('width', 200)
    .attr('height', 50)
    .attr('opacity', 0.1)
    .attr('opacity',0)
    .transition().duration(transitionDuration)
    .attr('opacity',0.1);

  pointOnLine
    .enter().append("text")
    .attr('transform', `translate(${1050 - 200},${240 - 30})`)
    .text("Starting of Second Wave")
    .attr('class', 'annotation-text')
    .attr('fill', 'black')
    .attr('opacity',0)
    .transition().duration(transitionDuration)
    .attr('opacity',1);


  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", Brazil_trendline.x())
    .attr("cy", Brazil_trendline.y())
    .attr("r", 3.5)
    .attr('opacity',0)
    .transition().duration(transitionDuration*2)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", Brazil_trendline.x())
    .attr("cy", Brazil_trendline.y())
    .attr("r", 11)
    .attr('opacity',0)
    .transition().duration(transitionDuration*2)
    .attr('opacity', 0.3);

  pointOnLine
    .enter().append("line")
    .attr("class", "dot")
    .style("stroke", "black")
    .attr("x1", Brazil_trendline.x())
    .attr("y1", Brazil_trendline.y())
    .attr("x2", 950)
    .attr("y2", 330)
    .attr('opacity',0)
    .transition().duration(transitionDuration*2)
    .attr('opacity',1);

  pointOnLine
    .enter().append("rect")
    .attr('transform', `translate(${950 - 200},${330 - 50})`)
    .attr('class', 'rect-tooltip')
    .attr('width', 200)
    .attr('height', 50)
    .attr('opacity',0)
    .transition().duration(transitionDuration*2)
    .attr('opacity', 0.1);

  pointOnLine
    .enter().append("text")
    .attr('transform', `translate(${950 - 200},${330 - 30})`)
    .text("Still into First Wave")
    .attr('class', 'annotation-text')
    .attr('fill', 'black')
    .attr('opacity',0)
    .transition().duration(transitionDuration*2)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", India_trendline.x())
    .attr("cy", India_trendline.y())
    .attr("r", 3.5)
    .attr('opacity',0)
    .transition().duration(transitionDuration*3)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", India_trendline.x())
    .attr("cy", India_trendline.y())
    .attr("r", 11)
    .attr('opacity',0)
    .transition().duration(transitionDuration*3)
    .attr('opacity', 0.3);

  pointOnLine
    .enter().append("line")
    .attr("class", "dot")
    .style("stroke", "black")
    .attr("x1", India_trendline.x())
    .attr("y1", India_trendline.y())
    .attr("x2", 950)
    .attr("y2", 330)
    .attr('opacity',0)
    .transition().duration(transitionDuration*3)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", France_trendline.x())
    .attr("cy", France_trendline.y())
    .attr("r", 3.5)
    .attr('opacity',0)
    .transition().duration(transitionDuration*5)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", France_trendline.x())
    .attr("cy", France_trendline.y())
    .attr("r", 11)
    .attr('opacity',0)
    .transition().duration(transitionDuration*5)
    .attr('opacity', 0.3);

  pointOnLine
    .enter().append("line")
    .attr("class", "dot")
    .style("stroke", "black")
    .attr("x1", France_trendline.x())
    .attr("y1", France_trendline.y())
    .attr("x2", 950)
    .attr("y2", 330)
    .attr('opacity',0)
    .transition().duration(transitionDuration*5)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", Germany_trendline.x())
    .attr("cy", Germany_trendline.y())
    .attr("r", 3.5)
    .attr('opacity',0)
    .transition().duration(transitionDuration*4)
    .attr('opacity',1);

  pointOnLine
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", Germany_trendline.x())
    .attr("cy", Germany_trendline.y())
    .attr("r", 11)
    .attr('opacity',0)
    .transition().duration(transitionDuration*4)
    .attr('opacity', 0.3);

  pointOnLine
    .enter().append("line")
    .attr("class", "dot")
    .style("stroke", "black")
    .attr("x1", Germany_trendline.x())
    .attr("y1", Germany_trendline.y())
    .attr("x2", 850)
    .attr("y2", 430)
    .attr('opacity',0)
    .transition().duration(transitionDuration*4)
    .attr('opacity',1);

  pointOnLine
    .enter().append("rect")
    .attr('transform', `translate(${850 - 200},${430 - 50})`)
    .attr('class', 'rect-tooltip')
    .attr('width', 200)
    .attr('height', 50)
    .attr('opacity',0)
    .transition().duration(transitionDuration*4)
    .attr('opacity', 0.1);

  pointOnLine
    .enter().append("text")
    .attr('transform', `translate(${850 - 200},${430 - 30})`)
    .text("Flattening the First Wave")
    .attr('class', 'annotation-text')
    .attr('fill', 'black')
    .attr('opacity',0)
    .transition().duration(transitionDuration*4)
    .attr('opacity',1);



  gEnter
    .append('text')
    .attr('class', 'title')
    .merge(g.select('.title'))
    .attr('y', -10)
    //.attr('x',innerWidth/2-190)
    .text(title);

  gEnter
    .append('text')
    .attr('class', 'parameter')
    .merge(g.select('.parameter'))
    .attr('y', -30)
    .attr('x',innerWidth/2-190)
    .text(parameter);



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
  //render(data);
  renderScene2('#scene2-svg',data)
});
