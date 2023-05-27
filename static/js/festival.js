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
  maxZoom:25,
}).addTo(map);

L.control.zoom({
  position: 'bottomright'
}).addTo(map);

map.setZoom(19);

// ------------------ HEATMAP ------------------

let heatmapLayer;

function createHeatmap(radius, blur, positions) {
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
  createHeatmap(radius, blur, positions);
  heatmapLayer.addTo(map);
}

radiusValue.textContent = radiusSlider.value;
blurValue.textContent = blurSlider.value;

radiusSlider.addEventListener("input", updateHeatmap);
blurSlider.addEventListener("input", updateHeatmap);

// ------------------ HEAT LEGEND ------------------

const densityValue = document.getElementById("density-value");
const real_participant = document.getElementById('num-participants');

function calculateIntensity(dataPoints, gridPoints, radius) {
    /*  */
    var intensities = [];

    for (var i = 0; i < gridPoints.features.length; i++) {
        var count = 0;
        for (var j = 0; j < dataPoints.length; j++) {
            var dx = grid.features[i].geometry.coordinates[0] - dataPoints[j][1];
            var dy = grid.features[i].geometry.coordinates[1] - dataPoints[j][2];
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius) {
                count++;
            }
        }
        intensities.push(count);
    }
    return intensities;
}

// ------------------ TIME SLIDER ------------------

const timeSlider = document.getElementById("time-slider");
const timeSliderValue = document.getElementById("time-slider-value");
const timeSliderSettings = document.getElementById("time-slider-settings");
const toggleTimeSliderButton = document.getElementById("toggle-time-slider");

const windowSize = 5 * 60; // 5 minutes window in seconds

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

  // get the paramerts from the sliders
  var radius = parseInt(radiusSlider.value);
  var blur = parseInt(blurSlider.value);
  
  // reload heatmap
  if (heatmapLayer){
    map.removeLayer(heatmapLayer);
  }
  positions = participant_positions.filter(([timestamp, a, b]) => timestamp >= windowStart && timestamp <= windowEnd);
  AlertPoints = AlertPositions.filter(([timestamp, a, b]) => timestamp >= windowStart && timestamp <= windowEnd);
  createHeatmap(radius, blur, positions);
  heatmapLayer.addTo(map);

  for (let i = 0; i < AlertPoints.length; i++) {
    const marker = L.marker([AlertPoints[i][1], AlertPoints[i][2]], {icon: new AlertIcon()});
    markersGroup.addLayer(marker);
  }

  // update the legend
  var intensities = calculateIntensity(positions, grid, 5);
  // 10 positions per 5 minutes (to not count the same dude multiple times)
  var maxdensity = Math.max(...intensities) / 10 / Math.PI / 5**2;
  var numParticipants = real_participant.value;
  let participant_ratio = number_of_participants / numParticipants;
  var density_approx = maxdensity / participant_ratio;

  densityValue.textContent = density_approx.toFixed(2)
}

timeSlider.addEventListener("input", updateTimestamp);
real_participant.addEventListener("input", updateTimestamp);

updateTimestamp();

// ------------------ CHART ------------------

function calculateCounts(positions) {
  // Initialize an empty object to hold counts
  let counts = {};

  // number of point computed
  let n = 500;

  // time delta between two points
  let delta = (endTimestamp - startTimestamp) / n;
  
  for (let timestamp = startTimestamp; timestamp < endTimestamp; timestamp += delta) {
    counts[timestamp] = 0;
  }

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

  // Convert the counts object to an array and return it
  return [Object.values(counts), Object.keys(counts)];
}

// Assuming you already have the timestamps and counts in separate arrays
let [counts, timestamps] = calculateCounts(participant_positions); // function to calculate counts

let ctx = document.getElementById('positionChart').getContext('2d');
let positionChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timestamps,
        datasets: [{
            label: 'Number of participants',
            data: counts,
            backgroundColor: [
                'rgba(255, 99, 132, 0)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
            fill: false,
            tension: 0.1
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: false, // hides the x-axis line
          grid: {
              display: false, // hides the x-axis grid lines
          },
          ticks: {
              display: false, // hides the x-axis labels
          },
        },
        y: {
          display: false, // hides the y-axis line
          grid: {
              display: false, // hides the y-axis grid lines
          },
          ticks: {
              display: false, // hides the y-axis labels
          },
          beginAtZero: true
        
        }
        },
        plugins: {
        legend: {
          display: false, // hides the legend
        },
        tooltip: {
          enabled: false, // disables tooltips
        },
        },
        elements: {
        point:{
          radius: 0 // hides the points
        }
      }
    }
});

