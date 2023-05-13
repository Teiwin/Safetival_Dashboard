// constants defined in the template
// const map = L.map("map")
// const participant_positions = [];
// const startTimestamp = 0;
// const endTimestamp = 1;

// ------------------ MAP ------------------

const markersGroup = L.layerGroup().addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxNativeZoom:22,
  maxZoom:25
}).addTo(map);

map.setZoom(19);

// ------------------ HEATMAP ------------------

let heatmapLayer;

function createHeatmap(radius, blur, positions) {
  if (!positions) {
    positions = participant_positions;
  }
  const heatmapData = positions.map(([_, lat, lng]) => [lat, lng, 0.3]);
  heatmapLayer = L.heatLayer(heatmapData, {
    radius: radius,
    blur: blur,
    maxZoom: 15,
  });
  heatmapLayer.addTo(map);
}

// Sliders
const radiusSlider = document.getElementById("radius");
const blurSlider = document.getElementById("blur");

const radiusValue = document.getElementById("radius-value");
const blurValue = document.getElementById("blur-value");

function updateHeatmap() {
  const radius = parseInt(radiusSlider.value);
  const blur = parseInt(blurSlider.value);

  radiusValue.textContent = radius;
  blurValue.textContent = blur;

  map.removeLayer(heatmapLayer);
  createHeatmap(radius, blur);
  heatmapLayer.addTo(map);
}

radiusValue.textContent = radiusSlider.value;
blurValue.textContent = blurSlider.value;

radiusSlider.addEventListener("input", updateHeatmap);
blurSlider.addEventListener("input", updateHeatmap);

// Initialize the heatmap with the initial slider values
createHeatmap(parseInt(radiusSlider.value), parseInt(blurSlider.value));

// ------------------ TIME SLIDER ------------------

const timeSlider = document.getElementById("time-slider");
const timeSliderValue = document.getElementById("time-slider-value");
const timeSliderSettings = document.getElementById("time-slider-settings");
const toggleTimeSliderButton = document.getElementById("toggle-time-slider");

const windowSize = 5 * 60; // 1 minutes window in seconds

function updateTimestamp() {
  const sliderValue = parseInt(timeSlider.value);
  const timestamp = startTimestamp + (sliderValue / 10000) * (endTimestamp - startTimestamp) - windowSize;
  current_date = new Date(timestamp * 1000)
  timeSliderValue.textContent = current_date.getHours() + ":" + current_date.getMinutes() + ":" + current_date.getSeconds();
  displayPositionsInWindow(timestamp - windowSize / 2, timestamp + windowSize / 2);
}

function displayPositionsInWindow(windowStart, windowEnd) {
  // Clear previous markers
  markersGroup.clearLayers();
  
  // reload heatmap
  map.removeLayer(heatmapLayer);
  positions = participant_positions.filter(([timestamp, a, b]) => timestamp >= windowStart && timestamp <= windowEnd);
  createHeatmap(parseInt(radiusSlider.value), parseInt(blurSlider.value), positions);
  heatmapLayer.addTo(map);

}

timeSlider.addEventListener("input", updateTimestamp);

// ------------------ CHART ------------------

function calculateCounts(positions) {
  // Initialize an empty object to hold counts
  let counts = {};

  // number of point computed
  let n = 1000;

  // time delta between two points
  let delta = (endTimestamp - startTimestamp) / n;
  

  // Iterate over the positions
  for (let i = 0; i < positions.length; i++) {
    // iterate over the time
    for (let timestamp = startTimestamp; timestamp < endTimestamp; timestamp += delta) {
      // compute the time window:
      let windowStart = timestamp - windowSize / 2;
      let windowEnd = timestamp + windowSize / 2;
      // Check if the position is within the time window
      if (positions[i][0] >= windowStart && positions[i][0] <= windowEnd) {
        // Increment the count for this timestamp
        if (counts[timestamp]) {
          counts[timestamp]++;
        } else {
          counts[timestamp] = 1;
        }
      }
    }
  }

  console.log(counts);
  // Convert the counts object to an array and return it
  return Object.values(counts);
}

// Assuming you already have the timestamps and counts in separate arrays
let timestamps = participant_positions.map(pos => pos[0]); // timestamps
let counts = calculateCounts(participant_positions); // function to calculate counts

let ctx = document.getElementById('positionChart').getContext('2d');
let positionChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timestamps,
        datasets: [{
            label: 'Position Count',
            data: counts,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
            },
            y: {
                beginAtZero: true
            }
        }
    }
});
