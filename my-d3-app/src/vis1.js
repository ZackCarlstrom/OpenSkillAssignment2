import * as d3 from "d3";

export function renderVis1() {

  // Set SVG dimensions and radial chart radii
  const width = 800;
  const height = 800;
  const innerRadius = 100;
  const outerRadius = width / 2 - 20;

  // Load data from GitHub and format
  // Keep only the last 12 months
  d3.json("https://raw.githubusercontent.com/altair-viz/vega_datasets/refs/heads/master/vega_datasets/_data/crimea.json")
    .then(data => {
      const filteredData = data.map(d => ({
        date: d3.timeParse("%Y-%m-%d")(d.date),
        wounds: d.wounds,
        other: d.other,
        disease: d.disease
      })).slice(-12);

      // Create main SVG container and center it
      const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Causes of Mortality and Colors
      const causes = ["other", "wounds", "disease"];
      // Colors: Blue, Orange, Green
      const colors = {
        disease: "#5796f1",
        wounds: "#fa9d58",
        other: "#008545"
      };

      // Splits up 2pi, or 360 degrees, evenly for 12 months
      const angle = d3.scaleBand()
        .domain(d3.range(filteredData.length))
        .range([0, 2 * Math.PI])
        .align(0);

      // Maps death counts to distance from center
      const radius = d3.scaleLinear()
        .domain([0, 1600])
        .range([innerRadius, outerRadius]);

      // Stack data by cause, creates [start, end] values for each arc layer per month
      const stack = d3.stack().keys(causes);

      // Arranges stack into an array, one per cause
      const series = stack(filteredData);

      // Create Tooltip, Hidden Initially
      const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px");

      // Create Radial Chart
      svg.append("g")
        .selectAll("g")
        // One group per cause
        .data(series)
        .join("g")
        // Fill in colors by cause
        .attr("fill", d => colors[d.key])
        .selectAll("path")
        .data(d => d)
        .join("path")

        // Create Arc Structure
        .attr("d", d3.arc()
          .innerRadius(d => radius(d[0]))
          .outerRadius(d => radius(d[1]))
          .startAngle((_, i) => angle(i))
          .endAngle((_, i) => angle(i) + angle.bandwidth())
          .padAngle(0.01)
          .padRadius(innerRadius)
        )

        // When hovering section, display tooltip
        .on("mouseover", function (event, d) {
            const cause = this.parentNode.__data__.key;
            const value = d.data[cause];
            const total = d.data.disease + d.data.wounds + d.data.other;
            const percent = ((value / total) * 100).toFixed(1);
            tooltip
              .style("opacity", 1)
              .html(`
                <strong>Cause:</strong> ${cause}<br/>
                <strong>Deaths:</strong> ${value}<br/>
                <strong>Percent of total:</strong> ${percent}%
              `);
          })
        
        // Position tooltip near mouse
        .on("mousemove", function (event) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })

        // Hide tooltip when user is not hovering
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
        });

      // Labels for segmented month and year
      svg.append("g")
        .selectAll("text")
        .data(filteredData)
        .join("text")
        .attr("text-anchor", "middle")

        //
        .attr("x", (d, i) => {
          // Calculate starting angle, add half of ending angle to center,
          // subtract 90 degrees to shift starting point
          const a = angle(i) + angle.bandwidth() / 2 - Math.PI / 2;
          const total = d.disease + d.wounds + d.other;
          // Calculate x position and adjust so it's outside of the radial chart
          return Math.cos(a) * (radius(total) + 30);
        })
        .attr("y", (d, i) => {
          const a = angle(i) + angle.bandwidth() / 2 - Math.PI / 2;
          const total = d.disease + d.wounds + d.other;
          // Calculate y position and adjust so it's outside of the radial chart
          return Math.sin(a) * (radius(total) + 30);
        })
        .text(d => d3.timeFormat("%b %Y")(d.date))
        .style("font-size", "12px")
        .style("font-weight", "bold");

      // Create Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${-(width / 2) + 20}, ${-(height / 2) + 20})`);

      causes.forEach((cause, i) => {

        // Colors for each cause
        legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", colors[cause]);

        // Text for each cause
        legend.append("text")
          .attr("x", 18)
          .attr("y", i * 20 + 10)
          .text(cause.charAt(0).toUpperCase() + cause.slice(1))
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
      });
    })
    .catch(error => {
      console.error("Vis 1 Error:", error);
    });
}
