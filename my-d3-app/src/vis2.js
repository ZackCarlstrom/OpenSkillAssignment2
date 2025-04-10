import * as d3 from "d3";

export function renderVis2() {

  // Set margin and visualziation dimensions
  const margin = { top: 40, right: 60, bottom: 50, left: 60 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Select chart container and add wrapper for UI elements and SVG
  const container = d3.select("#chart2")
    .append("div")
    .attr("class", "vis2-wrapper");

  // Add button to start the animation
  container.append("button")
    .attr("id", "start-btn")
    .text("Start Animation");

  // Create SVG with space for margins
  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Add group element and shift for margins
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Load data from GitHub and format
  d3.json("https://raw.githubusercontent.com/altair-viz/vega_datasets/refs/heads/master/vega_datasets/_data/crimea.json")
    .then(data => {
      const parsedData = data.map(d => ({
        date: d3.timeParse("%Y-%m-%d")(d.date),
        wounds: d.wounds,
        other: d.other,
        disease: d.disease
      }));

      // X scale, maps dates to horizontal position
      const x = d3.scaleTime()
        .domain(d3.extent(parsedData, d => d.date))
        .range([0, width]);

      // Y scale, maps death count to vertial position
      const y = d3.scaleLinear()
        .domain([0, d3.max(parsedData, d => Math.max(d.wounds, d.other, d.disease))])
        .range([height, 0]);

      // Specify causes and colors, same as other visualizations
      const causes = ["disease", "wounds", "other"];
      const colors = {
          disease: "#5796f1",
          wounds: "#fa9d58",
          other: "#008545"
        };

      // Generate line for each cause
      const lineGen = cause => d3.line()
        .x(d => x(d.date))
        .y(d => y(d[cause]));

      // Append x-axis
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Append y-axis
      g.append("g")
        .call(d3.axisLeft(y));

      // Add y-axis label
      // Did not add x-axis label because can be assumed from axis
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Deaths");

      // Draw lines for each cause
      // Hidden initially using stroke-dashoffset
      causes.forEach(cause => {
        const path = g.append("path")
          .datum(parsedData)
          .attr("class", `line-${cause}`)
          .attr("fill", "none")
          .attr("stroke", colors[cause])
          .attr("stroke-width", 2)
          .attr("d", lineGen(cause));

        // Get total path length for animation
        const totalLength = path.node().getTotalLength();

        // Hide the path using offset
        path
          .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
          .attr("stroke-dashoffset", totalLength);

      });

      // Animate lines when button is clicked
      d3.select("#start-btn").on("click", () => {
        causes.forEach(cause => {
          const path = g.select(`.line-${cause}`);
      
          path.transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on("end", () => {

                // Add labels for cause at the end of each line once animation is finished
                const lastPoint = parsedData[parsedData.length - 1];
                const xPos = x(lastPoint.date) + 8;
                const yPos = y(lastPoint[cause]);
              
                // Adjust y positioning for overlap
                let adjustedY = yPos;
                if (cause === "other") adjustedY -= 4;    
                if (cause === "disease") adjustedY += 4;
              
                // Add text labels for cause
                g.append("text")
                  .attr("x", xPos)
                  .attr("y", adjustedY)
                  .attr("fill", colors[cause])
                  .attr("alignment-baseline", "middle")
                  .style("font-size", "12px")
                  .style("font-weight", "bold")
                  .text(cause.charAt(0).toUpperCase() + cause.slice(1));

                // Store values of peaks from data
                const peakInfo = {
                  wounds: { value: 480, date: "1854-11-01" },
                  other: { value: 520, date: "1855-02-01" },
                  disease: { value: 1440, date: "1855-01-01" }
                };
                
                const { value, date } = peakInfo[cause];
                const parsedDate = d3.timeParse("%Y-%m-%d")(date);
                const peakX = x(parsedDate);
                const peakY = y(value);
                
                // Add peak labels
                g.append("text")
                  .attr("x", peakX)
                  .attr("y", peakY - 8)
                  .attr("text-anchor", "middle")
                  .attr("fill", colors[cause])
                  .style("font-size", "12px")
                  .style("font-weight", "bold")
                  .text(`${value} Deaths`);
                
                // Add dots for peaks
                g.append("circle")
                  .attr("cx", peakX)
                  .attr("cy", peakY)
                  .attr("r", 4)
                  .attr("fill", colors[cause]);
            });
        });
      });
    })
    .catch(error => {
      console.error("Vis 2 Error: ", error);
    });
}
