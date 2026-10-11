// ========================================
// GLOBAL TEMPERATURE HEAT MAP
// ========================================

const DATA_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// ========================================
// DIMENSIONS
// ========================================

const width = 1100;
const height = 520;

const margin = {
  top: 30,
  right: 30,
  bottom: 125,
  left: 100
};

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

// ========================================
// SVG
// ========================================

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

// ========================================
// CHART GROUP
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
// MONTHS
// ========================================

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// ========================================
// COLORS
// ========================================

const colors = [
  "#1e3a8a",
  "#2563eb",
  "#60a5fa",
  "#93c5fd",
  "#dbeafe",
  "#fef3c7",
  "#fcd34d",
  "#fb923c",
  "#ef4444",
  "#991b1b"
];

// ========================================
// LOAD DATA
// ========================================

d3.json(DATA_URL)
  .then(function (dataset) {

    const baseTemperature = dataset.baseTemperature;

    const data = dataset.monthlyVariance;

    // ========================================
    // TEMPERATURE RANGE
    // ========================================

    const temperatures = data.map(
      d => baseTemperature + d.variance
    );

    const minTemp = d3.min(temperatures);
    const maxTemp = d3.max(temperatures);

    // ========================================
    // COLOR SCALE
    // ========================================

    const colorScale = d3
      .scaleQuantize()
      .domain([minTemp, maxTemp])
      .range(colors);

    // ========================================
    // X SCALE - YEARS
    // ========================================

    const minYear = d3.min(data, d => d.year);
    const maxYear = d3.max(data, d => d.year);

    const xScale = d3
      .scaleLinear()
      .domain([minYear, maxYear + 1])
      .range([0, chartWidth]);

    // ========================================
    // Y SCALE - MONTHS (0 TO 11)
    // ========================================

    // freeCodeCamp expects months from 0 to 11.
    // Dataset months are from 1 to 12.

    const yScale = d3
      .scaleBand()
      .domain(d3.range(0, 12))
      .range([0, chartHeight])
      .padding(0);

    // ========================================
    // X AXIS
    // ========================================

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        d3.range(1754, 2016, 20)
      )
      .tickFormat(d3.format("d"));

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
      .tickFormat(d => months[d]);

    chart
      .append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    // ========================================
    // X AXIS LABEL
    // ========================================

    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 55)
      .attr("text-anchor", "middle")
      .text("Year");

    // ========================================
    // Y AXIS LABEL
    // ========================================

    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -80)
      .attr("text-anchor", "middle")
      .text("Month");

    // ========================================
    // CELL DIMENSIONS
    // ========================================

    const cellWidth =
      chartWidth / (maxYear - minYear + 1);

    const cellHeight = yScale.bandwidth();

    // ========================================
    // CREATE CELLS
    // ========================================

    chart
      .selectAll(".cell")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")

      // Required freeCodeCamp attributes
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr(
        "data-temp",
        d => baseTemperature + d.variance
      )

      // Position
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month - 1))

      // Size
      .attr("width", cellWidth)
      .attr("height", cellHeight)

      // Color
      .attr(
        "fill",
        d => colorScale(baseTemperature + d.variance)
      )

      // ========================================
      // MOUSE OVER
      // ========================================

      .on("mouseover", function (event, d) {

        const temperature =
          baseTemperature + d.variance;

        tooltip
          .attr("data-year", d.year)
          .style("opacity", 1)
          .html(`
            <div class="tooltip-date">
              ${months[d.month - 1]} ${d.year}
            </div>

            <div class="tooltip-value">
              ${temperature.toFixed(2)} °C
            </div>

            <div class="tooltip-variance">
              Variance:
              ${d.variance > 0 ? "+" : ""}
              ${d.variance.toFixed(2)} °C
            </div>
          `);

      })

      // ========================================
      // MOUSE MOVE
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
            `${event.clientY - rect.top - 75}px`
          );

      })

      // ========================================
      // MOUSE OUT
      // ========================================

      .on("mouseout", function () {

        tooltip.style("opacity", 0);

      });

    // ========================================
    // LEGEND
    // ========================================

    const legendWidth = 420;

    const legendX =
      (width - legendWidth) / 2;

    const legendY =
      height - 65;

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${legendX},${legendY})`
      );

    const legendCellWidth =
      legendWidth / colors.length;

    // ========================================
    // LEGEND RECTANGLES
    // ========================================

    legend
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d, i) => i * legendCellWidth
      )
      .attr("y", 0)
      .attr("width", legendCellWidth)
      .attr("height", 16)
      .attr("fill", d => d);

    // ========================================
    // LEGEND LABELS
    // ========================================

    const legendScale = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(
        d => `${d.toFixed(1)}°`
      );

    legend
      .append("g")
      .attr(
        "transform",
        "translate(0,16)"
      )
      .call(legendAxis);

    // ========================================
    // LEGEND TITLE
    // ========================================

    legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", legendWidth / 2)
      .attr("y", -12)
      .attr("text-anchor", "middle")
      .text("Temperature (°C)");

  })
  .catch(function (error) {

    console.error(
      "Error loading temperature data:",
      error
    );

  });