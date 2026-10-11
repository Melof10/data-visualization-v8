// ========================================
// US EDUCATION CHOROPLETH MAP
// ========================================

const EDUCATION_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const COUNTIES_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

// ========================================
// DIMENSIONS
// ========================================

const width = 1100;
const height = 720;

// ========================================
// SVG
// ========================================

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

// ========================================
// TOOLTIP
// ========================================

const tooltip = d3.select("#tooltip");

// ========================================
// COLORS
// ========================================

const colors = [
  "#eff6ff",
  "#dbeafe",
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af"
];

// ========================================
// LOAD DATA
// ========================================

Promise.all([
  d3.json(EDUCATION_URL),
  d3.json(COUNTIES_URL)
])
  .then(function ([educationData, usData]) {

    // ========================================
    // EDUCATION LOOKUP
    // ========================================

    const educationByFips = new Map(
      educationData.map(d => [d.fips, d])
    );

    // ========================================
    // TOPOJSON TO GEOJSON
    // ========================================

    const counties = topojson.feature(
      usData,
      usData.objects.counties
    ).features;

    // ========================================
    // COLOR SCALE
    // ========================================

    const minEducation = d3.min(
      educationData,
      d => d.bachelorsOrHigher
    );

    const maxEducation = d3.max(
      educationData,
      d => d.bachelorsOrHigher
    );

    const colorScale = d3
      .scaleQuantize()
      .domain([minEducation, maxEducation])
      .range(colors);

    // ========================================
    // GEO PATH
    // ========================================

    // The provided TopoJSON contains pre-projected coordinates.
    const path = d3.geoPath();

    // ========================================
    // MAP GROUP
    // ========================================

    const mapGroup = svg
      .append("g")
      .attr("class", "map-group")
      .attr("transform", "translate(80, 30)");

    // ========================================
    // DRAW COUNTIES
    // ========================================

    mapGroup
      .selectAll(".county")
      .data(counties)
      .enter()
      .append("path")
      .attr("class", "county")

      // Required attributes
      .attr("data-fips", d => d.id)

      .attr("data-education", d => {
        const county = educationByFips.get(d.id);

        return county
          ? county.bachelorsOrHigher
          : 0;
      })

      // Geographic shape
      .attr("d", path)

      // Fill color
      .attr("fill", d => {
        const county = educationByFips.get(d.id);

        return county
          ? colorScale(county.bachelorsOrHigher)
          : "#e2e8f0";
      })

      // ========================================
      // MOUSE OVER
      // ========================================

      .on("mouseover", function (event, d) {

        const county = educationByFips.get(d.id);

        if (!county) return;

        tooltip
          .attr(
            "data-education",
            county.bachelorsOrHigher
          )
          .style("opacity", 1)
          .html(`
            <div class="tooltip-location">
              ${county.area_name}, ${county.state}
            </div>

            <div class="tooltip-value">
              ${county.bachelorsOrHigher}%
            </div>

            <div class="tooltip-description">
              Adults with a bachelor's degree or higher
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
    // STATE BORDERS
    // ========================================

    mapGroup
      .append("path")
      .datum(
        topojson.mesh(
          usData,
          usData.objects.states,
          (a, b) => a !== b
        )
      )
      .attr("class", "state-borders")
      .attr("d", path);

    // ========================================
    // LEGEND
    // ========================================

    const legendWidth = 450;
    const legendHeight = 18;

    const legendX = (width - legendWidth) / 2;
    const legendY = height - 105;

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
      .attr("x", (d, i) => i * legendCellWidth)
      .attr("y", 0)
      .attr("width", legendCellWidth)
      .attr("height", legendHeight)
      .attr("fill", d => d);

    // ========================================
    // LEGEND SCALE
    // ========================================

    const legendScale = d3
      .scaleLinear()
      .domain([minEducation, maxEducation])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(6)
      .tickFormat(d => `${d}%`);

    legend
      .append("g")
      .attr(
        "transform",
        `translate(0,${legendHeight})`
      )
      .call(legendAxis);

    // ========================================
    // LEGEND TITLE
    // ========================================

    legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", legendWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .text("Bachelor's Degree or Higher (%)");

    // ========================================
    // VALIDATION
    // ========================================

    console.log("Choropleth Map loaded successfully");
    console.log("Counties:", counties.length);
    console.log("Education records:", educationData.length);

  })
  .catch(function (error) {

    console.error(
      "Error loading choropleth data:",
      error
    );

  });