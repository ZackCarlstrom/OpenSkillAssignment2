import * as d3 from "d3";

export function renderVis3() {

  // Set margin and visualziation dimensions
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = 700;
  const height = 500;
  const dotSize = 8;
  const dotsPerRow = 50;

  // Specify causes and colors, same as other visualizations
  const causes = ["disease", "wounds", "other"];
  const colors = {
    disease: "#5796f1",
    wounds: "#fa9d58",
    other: "#008545"
  };

  // Select chart container and add wrapper for UI elements and SVG
  const container = d3.select("#chart3")
    .append("div")
    .attr("class", "vis3-wrapper");

  // Create the legend
  const legend = container.append("div")
    .attr("class", "legend")
    .style("margin-bottom", "10px");

  // Add colored circle and label for cause
  causes.forEach((cause) => {
    legend.append("span")
      .style("margin-right", "20px")
      .html(`
        <span style="display:inline-block;width:12px;height:12px;background:${colors[cause]};margin-right:6px;border-radius:50%;"></span>
        ${cause.charAt(0).toUpperCase() + cause.slice(1)}
      `);
  });

  // Add input slider for changing date
  const slider = container.append("input")
    .attr("type", "range")
    .attr("min", -1)
    .attr("id", "dot-slider")
    .style("width", "250px")
    .style("margin-bottom", "1rem");

  // Add information box to display death counts and totals
  const infoBox = container.append("div")
    .attr("id", "dot-info")
    .style("margin-bottom", "1rem")
    .style("font-size", "14px")
    .style("line-height", "1.5");

  //Create SVG
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  // Add group element and shift for margins
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Load data from GitHub and format
  d3.json("https://raw.githubusercontent.com/altair-viz/vega_datasets/refs/heads/master/vega_datasets/_data/crimea.json")
    .then(rawData => {
      const data = rawData.map(d => ({
        date: d3.timeParse("%Y-%m-%d")(d.date),
        wounds: d.wounds,
        other: d.other,
        disease: d.disease
      }));

      // Set slider's maximum value to last index in dataset
      slider
        .attr("max", data.length - 1)
        .attr("value", -1);

      // Function to update the chart based on slider value
      function update(index) {

        // Show empty chart for starting point
        if (index < 0) {
          g.selectAll("circle").remove();
          infoBox.text("Move the slider to show number of deaths.");
          return;
        }

        // Calculate cumulative death totals
        const cumulative = { wounds: 0, disease: 0, other: 0 };
        const added = data[index];

        for (let i = 0; i <= index; i++) {
          cumulative.wounds += data[i].wounds;
          cumulative.disease += data[i].disease;
          cumulative.other += data[i].other;
        }

        // Convert cumulative totals into an array of dots
        // 1 dot = 10 deaths
        const allDots = [];
        Object.entries(cumulative).forEach(([type, count]) => {
          const numDots = Math.floor(count / 10);
          for (let i = 0; i < numDots; i++) {
            allDots.push({ type });
          }
        });

        // Set dots to SVG circles and position them in grid
        g.selectAll("circle")
          .data(allDots)
          .join("circle")
          .attr("r", dotSize / 2)
          .attr("fill", d => colors[d.type])
          .attr("cx", (_, i) => (i % dotsPerRow) * (dotSize + 2))
          .attr("cy", (_, i) => Math.floor(i / dotsPerRow) * (dotSize + 2));

        // Display cumulative totals and monthly additions
        const formattedDate = d3.timeFormat("%B %Y")(added.date);
        infoBox.html(`
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">${formattedDate}</div>
          <strong>Total Disease:</strong> ${cumulative.disease} deaths &nbsp;|&nbsp; <strong>Added:</strong> ${added.disease} deaths<br>
          <strong>Total Wounds:</strong> ${cumulative.wounds} deaths &nbsp;|&nbsp; <strong>Added:</strong> ${added.wounds} deaths<br>
          <strong>Total Other:</strong> ${cumulative.other} deaths &nbsp;|&nbsp; <strong>Added:</strong> ${added.other} deaths
        `);
      }

      // Call update function when slider changes value
      slider.on("input", function () {
        update(+this.value);
      });

      // Initialize chart for empty state
      update(-1);
    })
    .catch(error => {
      console.error("Vis 3 Error: ", error);
    });
}
