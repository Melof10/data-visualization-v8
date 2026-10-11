// ========================================
// UNITED STATES GDP - D3 BAR CHART
// ========================================

// Dataset oficial de freeCodeCamp
const DATA_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// ========================================
// CHART DIMENSIONS
// ========================================

const width = 1000;
const height = 500;

const margin = {
  top: 30,
  right: 30,
  bottom: 60,
  left: 85
};

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

// ========================================
// SVG CONTAINER
// ========================================

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

// ========================================
// MAIN CHART GROUP
// ========================================

const chart = svg
  .append("g")
  .attr(
    "transform",
    `translate(${margin.left},${margin.top})`
  );

// ========================================
// TOOLTIP
// ========================================

const tooltip = d3.select("#tooltip");

// ========================================
// FETCH GDP DATA
// ========================================

d3.json(DATA_URL)
  .then(function (dataset) {

    const data = dataset.data;

    // ========================================
    // PROCESS DATA
    // ========================================

    const parsedData = data.map(function (d) {
      return {
        date: d[0],
        gdp: d[1],
        parsedDate: new Date(d[0])
      };
    });

    // ========================================
    // X SCALE
    // ========================================

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(parsedData, d => d.parsedDate),
        d3.max(parsedData, d => d.parsedDate)
      ])
      .range([0, chartWidth]);

    // ========================================
    // Y SCALE
    // ========================================

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(parsedData, d => d.gdp)
      ])
      .range([chartHeight, 0]);

    // ========================================
    // X AXIS
    // ========================================

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(d3.timeYear.every(5))
      .tickFormat(d3.timeFormat("%Y"));

    chart
      .append("g")
      .attr("id", "x-axis")
      .attr(
        "transform",
        `translate(0,${chartHeight})`
      )
      .call(xAxis);

    // ========================================
    // Y AXIS
    // ========================================

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(10)
      .tickFormat(d3.format(","));

    chart
      .append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    // ========================================
    // Y AXIS LABEL
    // ========================================

    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -65)
      .attr("text-anchor", "middle")
      .text("Gross Domestic Product (Billions USD)");

    // ========================================
    // X AXIS LABEL
    // ========================================

    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 50)
      .attr("text-anchor", "middle")
      .text("Year");

    // ========================================
    // BAR WIDTH
    // ========================================

    const barWidth = chartWidth / parsedData.length;

    // ========================================
    // CREATE BARS
    // ========================================

    chart
      .selectAll(".bar")
      .data(parsedData)
      .enter()
      .append("rect")
      .attr("class", "bar")

      // Required freeCodeCamp attributes
      .attr("data-date", d => d.date)
      .attr("data-gdp", d => d.gdp)

      // Horizontal position
      .attr("x", d => xScale(d.parsedDate))

      // Vertical position
      .attr("y", d => yScale(d.gdp))

      // Bar width
      .attr("width", barWidth)

      // Bar height
      .attr(
        "height",
        d => chartHeight - yScale(d.gdp)
      )

      // ========================================
      // MOUSE OVER EVENT
      // ========================================

      .on("mouseover", function (event, d) {

        const date = new Date(d.date);

        const year = date.getUTCFullYear();

        const month = date.getUTCMonth();

        const quarter = Math.floor(month / 3) + 1;

        tooltip
          .attr("data-date", d.date)
          .style("opacity", 1)
          .html(`
            <div class="tooltip-date">
              ${year} - Q${quarter}
            </div>

            <div class="tooltip-value">
              $${d.gdp.toLocaleString("en-US")} Billion
            </div>
          `);
      })

      // ========================================
      // MOUSE MOVE EVENT
      // ========================================

      .on("mousemove", function (event) {

        const container = document
          .querySelector(".chart-container");

        const rect = container.getBoundingClientRect();

        tooltip
          .style(
            "left",
            `${event.clientX - rect.left + 15}px`
          )
          .style(
            "top",
            `${event.clientY - rect.top - 65}px`
          );
      })

      // ========================================
      // MOUSE OUT EVENT
      // ========================================

      .on("mouseout", function () {

        tooltip
          .style("opacity", 0);
      });

  })
  .catch(function (error) {

    console.error(
      "Error al cargar los datos del GDP:",
      error
    );

  });