const width = 1800, height = 780;
let data;
let svgId;
let yColumn;
let selectedSelectionValue;




const svg = d3.select('#final-svg').append("svg")
  .attr("width", width)
  .attr("height", height);

const dropdownMenu = (selection, props) => {
  const {
    options,
    onOptionClicked
  } = props;



  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select').merge(select)
    .on('change', function () {
      onOptionClicked(this.value);
    });

  const option = select.selectAll('option').data(options);
  option.enter().append('option').merge(option)
    .attr('value', d => d)
    .text(d => d);
};


const onYColumnClicked = column => {
  yColumn = column;
  renderFinal();
};


const onClick = d => {
  selectedSelectionValue = d
  renderFinal();
};

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

const selectionLegend = (selection, props) => {
  const {
    //selectionScale,
    circleRadiusSelectionLegend,
    spacing,
    textOffset,
    onClick,
    selectedSelectionValue
  } = props;

  const groups = selection.selectAll('g')
    .data(['South Asia', 'Europe & Central Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Latin America & Caribbean', 'East Asia & Pacific', 'North America']);
  const groupsEnter = groups.enter()
    .append('g')
    .attr('class', 'tick-selection');
  groupsEnter.merge(groups)
    .attr('transform', (d, i) => `translate(0, ${i * spacing})`)
    .attr('opacity', d =>
      //console.log(d))
      (!selectedSelectionValue || d === selectedSelectionValue)
        ? 1
        : 0
    )
    .on('click', d => onClick(
      d === selectedSelectionValue
        ? null
        : d
    ));

  groups.exit().remove();

  groupsEnter.append('circle')
    .merge(groups.select('circle'))
    .attr('r', circleRadiusSelectionLegend)
    .attr('fill', 'black');

  groupsEnter.append('text')
    .merge(groups.select('text'))
    .text(d => d)
    .attr('dy', '0.32em')
    .attr('x', textOffset);
};


const renderFinal = () => {

  const circleRadius = 10;



  d3.select('#menus')
    .call(dropdownMenu, {
      options: ['ConfirmedCases', 'RecoveredCases', 'Deaths'],
      onOptionClicked: onYColumnClicked
    });


  const nested = d3.nest()
    .key(function (d) { return d["IncomeGroup"]; })
    .key(function (d) { return d["CountryName"]; })
    .key(function (d) { return d["Region"]; })
    .rollup(function (d) {
      return {
        RecoveredCases: d3.sum(d, function (e) { return e["RecoveredCases"]; }),
        latestPopopulation: d3.mean(d, function (v) { return v["LatestPopopulation"]; }),
        //IncomeGroup: 
        ConfirmedCases: d3.sum(d, function (e) { return e["ConfirmedCases"]; }),
        Deaths: d3.sum(d, function (e) { return e["Deaths"]; }),
      };
    })
    .entries(data);

  //console.log(nested);

  const tempData = [null];
  let i = 0;

  for (const { key, values } of nested) {
    for (const value of values) {
      tempData[i] = {
        "LatestPopopulation": value.values[0]["value"]["latestPopopulation"],
        "ConfirmedCases": value.values[0]["value"]["ConfirmedCases"],
        "RecoveredCases": value.values[0]["value"]["RecoveredCases"],
        "Deaths": value.values[0]["value"]["Deaths"],
        "CountryName": value.key,
        "IncomeGroup": key,
        "Region": value.values[0].key
      };
      i = i + 1;

    }
  }

  data = tempData;

  const xValue = d => d.LatestPopopulation;
  const xAxisLabel = 'Population(2018)';
  const xAxisMinVal = 41000;

  const yValue = d => d[yColumn];
  const yAxisLabel = yColumn;
  const yAxisMinVal = 1;

  const mergin = {
    top: 60, bottom: 235, left: 200, right: 20
  };
  const innerWidth = width - mergin.left - mergin.right;
  const innerHeight = height - mergin.top - mergin.bottom;

  const xScale = d3.scaleLog()
    //.domain(d3.extent(data,xValue))
    .domain([xAxisMinVal, d3.max(data, xValue)])
    .range([0, innerWidth]).base(2)
    .nice();

  const yScale = d3.scaleLog()
    //.domain(d3.extent(data,yValue))
    .domain([yAxisMinVal, d3.max(data, yValue)])
    .range([innerHeight, 0]).base(2)
    .nice();



  const g = svg.selectAll('.container').data([null]);

  const colorLegendG = svg.append('g')
    .attr('transform', `translate(${width / 2},${height - mergin.bottom + 130})`);

  const selectionLegendG = svg.append('g')
    .attr('transform', `translate(${mergin.right},${height - mergin.bottom + 35})`);

  const gEnter = g.enter().append('g').attr('class', 'container');
  gEnter.merge(g)
    .attr('transform', `translate(${mergin.left},${mergin.top})`);

  const xAxisTickFormat = number => d3.format('.3s')(number).replace('G', 'B');
  const xAxis = d3.axisBottom(xScale).tickFormat(xAxisTickFormat).tickSize(-innerHeight).tickPadding(15).ticks(7);

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

  const title = 'Covid 19: ' + yColumn + '(07/22/2020) vs Population';

  const colorScale = d3.scaleOrdinal();
  const colorValue = data.map(d => d.IncomeGroup);

  colorScale.domain(colorValue)
    .domain(colorScale.domain().sort().reverse())
    .range(d3.schemeSpectral[colorScale.domain().length]);


  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadiusColorLegend: 10,
    spacing: 30,
    textOffset: 10
  });


  selectionLegendG.call(selectionLegend, {
    circleRadiusSelectionLegend: 5,
    spacing: 30,
    textOffset: 10,
    onClick,
    selectedSelectionValue
  });

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    //.style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");
/*
  const mouseover = function (d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  */

  const mouseoverWithSelected = function (d) {
    tooltip
      .style("opacity", 1)
    d3.select(d)
      .style("stroke", "black")
      //.style("opacity", 0.8)
  }

  const mouseoverWithNoSelected = function (d) {
    tooltip
      .style("opacity", 1)
    d3.select(d)
      .style("stroke", "black")
      //.style("opacity", 0.1)
  }

  const mousemove = function (d) {
    tooltip
      .html("Contry Name: " + d.CountryName + "<br>" + "Population: " + d.LatestPopopulation)
      .style("left", (d3.mouse(this)[0]) + "px")
      .style("top", (d3.mouse(this)[1] + 270) + "px")
  }
  /*
  const mouseleave = function (d, stateOfSelection) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", (stateOfSelection === 'matchedWithSelection') 
       ? 0.8
       : 0.1
      )
  }
  */

 const mouseleaveWithSelected = function (d) {
  tooltip
    .style("opacity", 0)
  d3.select(d)
    .style("stroke", "none")
   // .style("opacity", 0.8)
}

const mouseleaveWithNoSelected = function (d) {
  tooltip
    .style("opacity", 0)
  d3.select(d)
    .style("stroke", "none")
    //.style("opacity", 0.1)
}

  const circles = g.merge(gEnter)
    .selectAll('circle').data(data);
  circles.enter().append('circle')
    .attr('cy', innerHeight / 2)
    .attr('cx', innerWidth / 2)
    .attr('r', 0)
    .attr('fill', d =>
      (!selectedSelectionValue || d.Region === selectedSelectionValue)
        ? colorScale(d.IncomeGroup)
        : 'grey'
    )
    .attr('opacity', d =>
      (!selectedSelectionValue || d.Region === selectedSelectionValue)
        ? 0.7
        : 0.1
    )
    .on("mouseover", function(d) {
      (!selectedSelectionValue || d.Region === selectedSelectionValue)
        ? mouseoverWithSelected(this)
        : mouseoverWithNoSelected(this)
      }
    )
    .on("mousemove", mousemove)
    .on("mouseleave", function(d) {
      (!selectedSelectionValue || d.Region === selectedSelectionValue)
        ? mouseleaveWithSelected(this)
        : mouseleaveWithNoSelected(this)
      }
    )
    .merge(circles)
    .transition().duration(2000)
    .delay((d, i) => i * 10)
    .attr('class', 'myCircle')
     //.attr('opacity',function(d) {console.log(selectedSelectionValue+"_"+d.Region+"_"+this.)})
    .attr('opacity', d =>
      (!selectedSelectionValue || d.Region === selectedSelectionValue)
        ? 0.7
        : 0.1
    )
    .attr('fill', d =>
    (!selectedSelectionValue || d.Region === selectedSelectionValue)
      ? colorScale(d.IncomeGroup)
      : 'grey'
    )
    .attr('cy', d => yScale(yValue(d)))
    .attr('cx', d => xScale(xValue(d)))
    .attr('r', circleRadius);

  gEnter
    .append('text')
    .attr('class', 'title')
    .merge(g.select('.title'))
    .attr('y', -10)
    .text(title);

};

Promise.all([
  d3.csv('data/latest_covid19_confirmed_deaths_recovered.csv'),
  d3.csv("data/Metadata_Country.csv")
]).then(([covidData, countryData]) => {
  const covidDataWithCountry = covidData.map((cd) => {
    var haveEqualId = (c) => c.CountryName === cd.Country;
    var covidDataWithEqualId = countryData.find(haveEqualId);
    return Object.assign({}, cd, covidDataWithEqualId);
  })
  covidDataWithCountry.forEach(d => {
    d.LatestPopopulation = +d.LatestPopopulation;
    d.IncomeGroup = d.IncomeGroup;
    d.ConfirmedCases = +d.ConfirmedCases;
    d.Region = d.Region;
    d.Deaths = +d.Deaths;
    d.RecoveredCases = +d.RecoveredCases;
  });
  data = covidDataWithCountry;
  yColumn = 'ConfirmedCases';
  renderFinal();
});