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

const renderScene3 = (svgId, data) => {
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
  const yAxisLabel = 'Number of Deaths';
  const yAxisMinVal = 0;
  const yAxisMaxVal = d3.max(data, d => {
    return Math.max(d.India, d.US, d.Brazil, d.Russia, d.Mexico);
  });

  const margin = {
    top: 60, bottom: 90, left: 130, right: 230
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const title = '';
  const parameter = 'Deaths';
  const colorValue = ['Mexico', 'Russia', 'India', 'Brazil', 'US'];
  const transitionDuration = 5000;

  const colorScale = d3.scaleOrdinal()
    .domain(colorValue)
    .range(['#d7191c', '#fdae61', 'purple', '#2c7bb6', '#1a9850']);  // Custom colors

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
    Mexico: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.Mexico)).curve(d3.curveBasis),
    Russia: d3.line().x(d => xScale(xValue(d))).y(d => yScale(d.Russia)).curve(d3.curveBasis),
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
        // Calculate the offset in pixels (0.5 cm ≈ 19 pixels)
        const offsetX = 19;
        const offsetY = -19;

        // Get the mouse position
        const [x, y] = d3.mouse(this);

        // Find the closest data point
        const date = xScale.invert(x);
        const closestData = data.reduce((prev, curr) =>
            Math.abs(curr.Time - date) < Math.abs(prev.Time - date) ? curr : prev);

        // Update the tooltip's content and position
        tooltip.html(`${country}<br>Time: ${closestData.Time.toLocaleDateString()}<br>Deaths: ${closestData[country]}`)
            .style("left", `${x + margin.left + offsetX}px`) // Adjust the x position
            .style("top", `${y + margin.top + offsetY}px`); // Adjust the y position
      })
      .on('mouseout', function(event, d) {
        tooltip.style("visibility", "hidden");
      })
      .transition().duration(transitionDuration * (i + 1))
      .attr('opacity', 0.7);
  });

  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadiusColorLegend: 10,
    spacing: 30,
    textOffset: 10
  });
};

d3.csv("data/transposed_covid_death.csv").then(rawData => {
  data = rawData.map(d => ({
    Time: new Date(d.Time),
    US: +d.US,
    India: +d.India,
    Mexico: +d.Mexico,
    Russia: +d.Russia,
    Brazil: +d.Brazil
  })).filter(d =>
    !isNaN(d.Time) && !isNaN(d.US) && !isNaN(d.India) && !isNaN(d.Mexico) && !isNaN(d.Russia) && !isNaN(d.Brazil)
  );

  renderScene3("#scene3-svg", data);
});
