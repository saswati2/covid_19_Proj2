const width = 1800, height = 780;
    let dataCases, dataDeaths;

    const renderIndexPage = (svgId, data, metric, year) => {
      const svg = d3.select(svgId).select("svg");
      if (!svg.empty()) {
        svg.remove();
      }

      const svgNew = d3.select(svgId).append("svg")
        .attr("width", width)
        .attr("height", height);

      const nested = d3.nest()
        .key(function (d) { return d["Country/Region"]; })
        .rollup(function (d) {
          let latestDate = getLatestDateUntil(year);
          return {
            latestConfirmedCases: d3.sum(d, function (e) { return e[latestDate]; }),
            latestDeaths: d3.sum(d, function (e) { return e[latestDate]; })
          };
        })
        .entries(data);

      const metricKey = metric === "cases" ? "latestConfirmedCases" : "latestDeaths";
      data = nested.sort((a, b) => d3.descending(+a["value"][metricKey], +b["value"][metricKey])).slice(0, 50);

      const xValue = d => d["value"][metricKey];
      const yValue = d => d["key"];

      const margin = {
        top: 60, bottom: 85, left: 200, right: 20
      };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth]);

      const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.11);

      const g = svgNew.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xAxisTickFormat = number => d3.format('.3s')(number).replace('G', 'B');

      const xAxis = d3.axisBottom(xScale).tickFormat(xAxisTickFormat).tickSize(-innerHeight);

      g.append('g').call(d3.axisLeft(yScale))
        .selectAll('.domain,.tick line')
        .remove();
      const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

      xAxisG.selectAll('.domain').remove();

      const axisLabelText = metric === "cases" ? `Number of Confirmed Cases until ${year}${year === '2023' ? ' (03/09/2023)' : ''}` : `Number of Deaths until ${year}${year === '2023' ? ' (03/09/2023)' : ''}`;

      xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 70)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(axisLabelText);

      const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

      const mouseover = function (d) {
        tooltip
          .style("opacity", 1);
        d3.select(this)
          .style("stroke", "black")
          .style('fill', 'orange');
      }
      const mousemove = function (d) {
        tooltip
          .html(`${metric === "cases" ? "Total Number of confirmed cases: " : "Total Number of deaths: "} ${xValue(d)}`)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      }
      const mouseleave = function (d) {
        tooltip
          .style("opacity", 0);
        d3.select(this)
          .style("stroke", "none")
          .style('fill', metric === "cases" ? 'steelblue' : '#d3494e');
      }

      g.selectAll('rect').data(data)
        .enter().append('rect')
        .attr('y', d => yScale(yValue(d)))
        .attr('width', 10)
        .attr('height', 10)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition().duration(5000)
        .attr('width', d => xScale(xValue(d)))
        .attr('height', yScale.bandwidth())
        .style('fill', metric === "cases" ? 'steelblue' : '#d3494e');

      g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text('Top 50 Countries');
    };

    const getLatestDateUntil = (year) => {
      switch (year) {
        case "2020":
          return "12/31/20";
        case "2021":
          return "12/31/21";
        case "2022":
          return "12/31/22";
        case "2023":
          return "3/9/23";
        default:
          return "3/9/23";
      }
    };

    d3.csv('data/time_series_covid19_confirmed_global_latest.csv').then(data => {
      dataCases = data;
      d3.csv('data/time_series_covid19_deaths_global_latest.csv').then(data => {
        dataDeaths = data;
        const selectedYear = d3.select("#year-select").property("value");
        renderIndexPage('#index-svg', dataCases, "cases", selectedYear);

        d3.select("#metric-select").on("change", function () {
          const selectedMetric = this.value;
          const selectedYear = d3.select("#year-select").property("value");
          if (selectedMetric === "cases") {
            renderIndexPage('#index-svg', dataCases, "cases", selectedYear);
          } else if (selectedMetric === "deaths") {
            renderIndexPage('#index-svg', dataDeaths, "deaths", selectedYear);
          }
        });

        d3.select("#year-select").on("change", function () {
          const selectedYear = this.value;
          const selectedMetric = d3.select("#metric-select").property("value");
          if (selectedMetric === "cases") {
            renderIndexPage('#index-svg', dataCases, "cases", selectedYear);
          } else if (selectedMetric === "deaths") {
            renderIndexPage('#index-svg', dataDeaths, "deaths", selectedYear);
          }
        });
      });
    });
