// ========================================
// CYCLIST SCATTERPLOT GRAPH
// ========================================

const DATA_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// ========================================
// CHART DIMENSIONS
// ========================================

const width = 1000;
const height = 550;

const margin = {
  top: 40,
  right: 220,
  bottom: 70,
  left: 90
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
// COLORS
// ========================================

const COLORS = {
  doping: "#ef4444",
  clean: "#3b82f6"
};

// ========================================
// LOAD DATA
// ========================================

d3.json(DATA_URL)
  .then(function (dataset) {

    // ========================================
    // PROCESS DATA
    // ========================================

    const data = dataset.map(function (d) {

      const [minutes, seconds] = d.Time.split(":").map(Number);

      const timeDate = new Date(Date.UTC(
        1970,
        0,
        1,
        0,
        minutes,
        seconds
      ));

      return {
        ...d,
        timeDate: timeDate
      };

    });

    // ========================================
    // X SCALE - YEARS
    // ========================================

    const minYear = d3.min(data, d => d.Year);
    const maxYear = d3.max(data, d => d.Year);

    const xScale = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([0, chartWidth]);

    // ========================================
    // Y SCALE - TIME
    // ========================================

    const minTime = d3.min(data, d => d.timeDate);
    const maxTime = d3.max(data, d => d.timeDate);

    const yScale = d3
      .scaleTime()
      .domain([minTime, maxTime])
      .range([0, chartHeight]);

    // ========================================
    // X AXIS
    // ========================================

    const xAxis = d3
      .axisBottom(xScale)
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
      .tickFormat(d3.utcFormat("%M:%S"));

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
      .attr("y", -65)
      .attr("text-anchor", "middle")
      .text("Time (Minutes:Seconds)");

    // ========================================
    // CREATE DOTS
    // ========================================

    chart
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")

      // Required freeCodeCamp attributes
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => d.timeDate.toISOString())

      // Dot position
      .attr("cx", d => xScale(d.Year))
      .attr("cy", d => yScale(d.timeDate))

      // Dot size
      .attr("r", 6)

      // Dot color
      .attr("fill", d =>
        d.Doping ? COLORS.doping : COLORS.clean
      )

      // ========================================
      // MOUSE OVER
      // ========================================

      .on("mouseover", function (event, d) {

        tooltip
          .attr("data-year", d.Year)
          .style("opacity", 1)
          .html(`
            <div class="tooltip-name">
              ${d.Name}
            </div>

            <div class="tooltip-info">
              ${d.Nationality}
            </div>

            <div class="tooltip-info">
              Year: ${d.Year}
            </div>

            <div class="tooltip-info">
              Time: ${d.Time}
            </div>

            ${
              d.Doping
                ? `<div class="tooltip-doping">
                     ${d.Doping}
                   </div>`
                : `<div class="tooltip-info">
                     No doping allegations
                   </div>`
            }
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
            `${event.clientY - rect.top - 80}px`
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

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${width - 195},${height / 2 - 40})`
      );

    legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", -25)
      .text("Classification");

    const legendData = [
      {
        label: "Doping allegations",
        color: COLORS.doping
      },
      {
        label: "No doping allegations",
        color: COLORS.clean
      }
    ];

    const legendItems = legend
      .selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        (d, i) => `translate(0,${i * 30})`
      );

    legendItems
      .append("circle")
      .attr("cx", 7)
      .attr("cy", 0)
      .attr("r", 7)
      .attr("fill", d => d.color);

    legendItems
      .append("text")
      .attr("x", 22)
      .attr("y", 4)
      .text(d => d.label);

  })
  .catch(function (error) {

    console.error(
      "Error loading cyclist data:",
      error
    );

  });