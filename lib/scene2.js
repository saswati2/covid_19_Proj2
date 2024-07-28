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
      .attr('stroke-width', 3)  
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

  // Annotation for January 3, 2022
  const annotationDate1 = new Date('2022-01-03');
  const annotationX1 = xScale(annotationDate1);
  const annotationUSY1 = yScale(data.find(d => d.Time.toDateString() === annotationDate1.toDateString()).US);
  const annotationIndiaY1 = yScale(data.find(d => d.Time.toDateString() === annotationDate1.toDateString()).India);
  const annotationFranceY1 = yScale(data.find(d => d.Time.toDateString() === annotationDate1.toDateString()).France);
  const annotationBrazilY1 = yScale(data.find(d => d.Time.toDateString() === annotationDate1.toDateString()).Brazil);
  const annotationGermanyY1 = yScale(data.find(d => d.Time.toDateString() === annotationDate1.toDateString()).Germany);


  gEnter.append('circle')
    .attr('cx', annotationX1)
    .attr('cy', annotationUSY1)
    .attr('r', 6)
    .attr('fill', 'black');

  gEnter.append('circle')
    .attr('cx', annotationX1)
    .attr('cy', annotationIndiaY1)
    .attr('r', 6)
    .attr('fill', 'black');

  gEnter.append('circle')
    .attr('cx', annotationX1)
    .attr('cy', annotationFranceY1)
    .attr('r', 6)
    .attr('fill', 'black');

  gEnter.append('circle')
    .attr('cx', annotationX1)
    .attr('cy', annotationBrazilY1)
    .attr('r', 6)
    .attr('fill', 'black');

  gEnter.append('circle')
    .attr('cx', annotationX1)
    .attr('cy', annotationGermanyY1)
    .attr('r', 6)
    .attr('fill', 'black');

  

  // Line with arrow
  gEnter.append('line')
    .attr('x1', annotationX1)
    .attr('x2', annotationX1)
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,4');

  gEnter.append('polygon')
    .attr('points', `${annotationX1 - 5},${innerHeight - 10} ${annotationX1 + 5},${innerHeight - 10} ${annotationX1},${innerHeight - 30}`)
    .attr('fill', 'black');

  // Text with background box
  const textBoxPadding1 = 6;
  const text1 = "Spike of Cases due to Omicron variant";
  const textWidth1 = 300;
  const textHeight1 = 24;

  gEnter.append('rect')
    .attr('x', annotationX1 - textWidth1 / 2 - textBoxPadding1)
    .attr('y', -textHeight1 - textBoxPadding1)
    .attr('width', textWidth1 + 2 * textBoxPadding1)
    .attr('height', textHeight1 + 2 * textBoxPadding1)
    .attr('fill', '#fff')
    .attr('stroke', '#000')
    .attr('stroke-width', 1);

  gEnter.append('text')
    .attr('x', annotationX1)
    .attr('y', -textBoxPadding1)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .text(text1);

  // Annotation for October 24, 2020
  const annotationDate2 = new Date('2020-10-24');
  const annotationX2 = xScale(annotationDate2);
  const annotationY2 = yScale(data.find(d => d.Time.toDateString() === annotationDate2.toDateString()).US);

  const delay1 = 1000; // Delay in milliseconds
  const duration1 = 1000; // Duration of the transition in milliseconds


  // Black point
  gEnter.append('circle')
    .attr('cx', annotationX2)
    .attr('cy', annotationY2)
    .attr('r', 6)
    .attr('fill', 'black')
    .transition()
    .delay(delay1)
    .duration(duration1);

  // Straight line
  gEnter.append('line')
    .attr('x1', annotationX2)
    .attr('x2', annotationX2)
    .attr('y1', annotationY2)
    .attr('y2', annotationY2 - 180)  // 180 pixels above the curve
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,4').transition()
    .delay(delay1)
    .duration(duration1);

  // Rectangle with text
  const textBoxPadding2 = 8;
  const text2 = "Starting of 2nd wave caused by delta variant in US";
  const textWidth2 = 300;
  const textHeight2 = 24;

  gEnter.append('rect')
    .attr('x', annotationX2 - textWidth2 / 2 - textBoxPadding2)
    .attr('y', annotationY2 - textHeight2 - 180 - textBoxPadding2) // Positioned 180 pixels above
    .attr('width', textWidth2 + 2 * textBoxPadding2)
    .attr('height', textHeight2 + 2 * textBoxPadding2)
    .attr('fill', '#fff')
    .attr('stroke', '#000')
    .attr('stroke-width', 1).transition()
    .delay(delay1)
    .duration(duration1);

  gEnter.append('text')
    .attr('x', annotationX2)
    .attr('y', annotationY2 - textHeight2 / 2 - 180 + textBoxPadding2) // Positioned 180 pixels above
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .text(text2).transition()
    .delay(delay1)
    .duration(duration1);



  //3rd annotation
  const annotationDate3 = new Date('2021-05-06');
  const annotationX3 = xScale(annotationDate3);
  const annotationY3 = yScale(data.find(d => d.Time.toDateString() === annotationDate3.toDateString()).India);

  // Black point
  gEnter.append('circle')
    .attr('cx', annotationX3)
    .attr('cy', annotationY3)
    .attr('r', 6)
    .attr('fill', 'black');

  // Straight line
  gEnter.append('line')
    .attr('x1', annotationX3)
    .attr('x2', annotationX3)
    .attr('y1', annotationY3)
    .attr('y2', annotationY3 - 180)  // 180 pixels above the curve
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,4');

  // Rectangle with text
  const textBoxPadding3 = 8;
  const text3 = "Middle of 3rd wave caused by Delta Varient in India";
  const textWidth3 = 300;
  const textHeight3 = 24;

  gEnter.append('rect')
    .attr('x', annotationX3 - textWidth3 / 2 - textBoxPadding3)
    .attr('y', annotationY3 - textHeight3 - 180 - textBoxPadding3) // Positioned 180 pixels above
    .attr('width', textWidth3 + 2 * textBoxPadding3)
    .attr('height', textHeight3 + 2 * textBoxPadding3)
    .attr('fill', '#fff')
    .attr('stroke', '#000')
    .attr('stroke-width', 1);

  gEnter.append('text')
    .attr('x', annotationX3)
    .attr('y', annotationY3 - textHeight3 / 2 - 180 + textBoxPadding3) // Positioned 180 pixels above
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .text(text3);

  

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
