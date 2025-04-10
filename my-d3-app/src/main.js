import { renderVis1 } from '/src/vis1.js';
import { renderVis2 } from '/src/vis2.js';
import { renderVis3 } from '/src/vis3.js';

const content = document.getElementById('content');
const links = document.querySelectorAll('a[data-view]');

function loadView(view) {
  const views = {
    about: `
      <h2>About</h2>
      <p>My name is Zack Carlstrom and this is my Open Skill Assignment 2 for INFO 4602: Information Visualization. This project uses D3.js to visualize historical data from the Crimean War. The data comes from the
      <a href="https://raw.githubusercontent.com/altair-viz/vega_datasets/refs/heads/master/vega_datasets/_data/crimea.json"
      >Vega-Datasets</a> Github Repository, which is a dataset we used early on during the semester. Below are some sketches of the three created visualizations. To view the final charts, navigate to them
      using the navbar at the top.</p>
      <h2 style="margin-top: 4rem;">Sketches:</h2>
      <div class="vis-sketches">
      
        <div class="vis-sketch">
          <h3>Visualization 1: Stacked Radial Chart</h3>
          <img src="public/sketches/vis1.jpeg" alt="Sketch of Visualization 1" width="300" />
          <p></p>
        </div>
      
        <div class="vis-sketch">
          <h3>Visualization 2: Animated Line Chart</h3>
          <img src="public/sketches/vis2.jpeg" alt="Sketch of Visualization 2" width="300" />
          <p></p>
        </div>
      
        <div class="vis-sketch">
          <h3>Visualization 3: Dot Grid</h3>
          <img src="public/sketches/vis3.jpeg" alt="Sketch of Visualization 3" width="300" />
          <p></p>
        </div>
      
      </div>
    
    `,
    vis1: `<h2>Visualization 1</h2>
    <h3>Causes of Mortality in the Crimean War: <a href="https://www.scientificamerican.com/article/how-florence-nightingale-changed-data-visualization-forever/">Nightingale Inspiration</a></h3>
    <p style="font-size: 13px;">*Hover over the chart to view specific information</p>
    <div id="chart1"></div>`,
    vis2: `<h2>Visualization 2</h2>
    <h3>Causes of Death in Crimean War Over Time</h3>
    <p>Click the "Start Animation" button to view the chart<p>
    <div id="chart2"></div>`,
    vis3: `<h2>Visualization 3</h2>
    <h3>Cumulative Deaths in the Crimean War</h3>
    <p style="font-size: 15px;">*1 dot is equal to 10 deaths</p>
    <div id="chart3"></div>`
  };

  content.innerHTML = views[view];

  if (view === 'vis1') renderVis1();
  if (view === 'vis2') renderVis2();
  if (view === 'vis3') renderVis3();
}

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const view = e.target.dataset.view;
    loadView(view);
  });
});

loadView('about');


