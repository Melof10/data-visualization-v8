// ========================================
// VIDEO GAME SALES TREEMAP
// ========================================

const DATA_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

// ========================================
// DIMENSIONS
// ========================================

const width = 1100;
const height = 850;

const margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
};

const chartWidth = width - margin.left - margin.right;

// Space reserved for legend
const treemapHeight = 590;

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
// COLOR PALETTE
// ========================================

const palette = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#ea580c",
  "#dc2626",
  "#9333ea",
  "#0284c7",
  "#65a30d",
  "#d97706",
  "#be185d",
  "#0d9488",
  "#4f46e5",
  "#b45309",
  "#475569",
  "#16a34a",
  "#c026d3",
  "#0369a1"
];

// ========================================
// LOAD DATA
// ========================================

d3.json(DATA_URL)
  .then(function (data) {

    // ========================================
    // CATEGORIES
    // ========================================

    const categories = data.children.map(
      d => d.name
    );

    // ========================================
    // COLOR SCALE
    // ========================================

    const colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range(palette);

    // ========================================
    // HIERARCHY
    // ========================================

    const root = d3
      .hierarchy(data)
      .sum(d => Number(d.value) || 0)
      .sort((a, b) => b.value - a.value);

    // ========================================
    // TREEMAP LAYOUT
    // ========================================

    d3
      .treemap()
      .size([chartWidth, treemapHeight])
      .paddingInner(1)
      .round(false)(root);

    // ========================================
    // LEAF NODES
    // ========================================

    const leaves = root.leaves();

    // ========================================
    // MAP GROUP
    // ========================================

    const mapGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`
      );

    // ========================================
    // TILE GROUPS
    // ========================================

    const tiles = mapGroup
      .selectAll(".tile-group")
      .data(leaves)
      .enter()
      .append("g")
      .attr("class", "tile-group")
      .attr(
        "transform",
        d => `translate(${d.x0},${d.y0})`
      );

    // ========================================
    // DRAW TILES
    // ========================================

    tiles
      .append("rect")
      .attr("class", "tile")

      // Required attributes
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)

      // Size
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)

      // Color
      .attr(
        "fill",
        d => colorScale(d.data.category)
      )

      // ========================================
      // MOUSE OVER
      // ========================================

      .on("mouseover", function (event, d) {

        tooltip
          .attr("data-value", d.data.value)
          .style("opacity", 1)
          .html(`
            <div class="tooltip-name">
              ${d.data.name}
            </div>

            <div class="tooltip-category">
              Platform: ${d.data.category}
            </div>

            <div class="tooltip-value">
              Sales: ${d3.format(",")(d.data.value)}
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
    // TILE LABELS
    // ========================================

    tiles
      .append("text")
      .attr("class", "tile-label")
      .attr("x", 5)
      .attr("y", 15)
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 5)
      .attr("dy", (d, i) => i === 0 ? 0 : 12)
      .text(d => d);

    // ========================================
    // LEGEND
    // ========================================

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(70, 650)");

    // ========================================
    // LEGEND TITLE
    // ========================================

    legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", -20)
      .text("Video Game Platforms");

    // ========================================
    // LEGEND LAYOUT
    // ========================================

    const columns = 6;
    const columnWidth = 165;
    const rowHeight = 35;

    // ========================================
    // LEGEND ITEMS
    // ========================================

    const legendItems = legend
      .selectAll(".legend-group")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "legend-group")
      .attr(
        "transform",
        (d, i) => {
          const column = i % columns;
          const row = Math.floor(i / columns);

          return `translate(${column * columnWidth},${row * rowHeight})`;
        }
      );

    legendItems
      .append("rect")
      .attr("class", "legend-item")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colorScale(d));

    legendItems
      .append("text")
      .attr("x", 27)
      .attr("y", 13)
      .text(d => d);

    // ========================================
    // VALIDATION
    // ========================================

    console.log("Treemap loaded successfully");
    console.log("Categories:", categories.length);
    console.log("Tiles:", leaves.length);

  })
  .catch(function (error) {

    console.error(
      "Error loading treemap data:",
      error
    );

  });