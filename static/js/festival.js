// constants defined in the template
// const map = L.map("map")
// const participant_positions = [];
// const startTimestamp = 0;
// const endTimestamp = 1;

// ------------------ MAP ------------------

const markersGroup = L.layerGroup().addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxNativeZoom:17,
  maxZoom:25
}).addTo(map);

map.setZoom(22);
// Add participant positions to the map
function showAllPositions() {
  participant_positions.forEach(([timestamp, lat, lng]) => {
      // Use circleMarker with red color and custom radius
      const marker = L.circleMarker([lat, lng], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1,
        radius: 2
      })
      markersGroup.addLayer(marker);
    });
}
showAllPositions()

// ------------------ TIME SLIDER ------------------

const timeSlider = document.getElementById("time-slider");
const timeSliderValue = document.getElementById("time-slider-value");
const timeSliderSettings = document.getElementById("time-slider-settings");
const toggleTimeSliderButton = document.getElementById("toggle-time-slider");

const windowSize = 1 * 60 * 1000; // 10 minutes window in milliseconds

function updateTimestamp() {
  const sliderValue = parseInt(timeSlider.value);
  const timestamp = startTimestamp + (sliderValue / 1000) * (endTimestamp - startTimestamp) - windowSize;
  timeSliderValue.textContent = sliderValue / 10;
  displayPositionsInWindow(timestamp, timestamp + windowSize);
}

function displayPositionsInWindow(windowStart, windowEnd) {
  // Clear previous markers
  markersGroup.clearLayers();

  // Add markers for positions within the time window
  participant_positions.forEach(([timestamp, lat, lng]) => {
    if (timestamp >= windowStart && timestamp <= windowEnd) {
      const marker = L.circleMarker([lat, lng], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1,
        radius: 5
      })
      markersGroup.addLayer(marker);
    }
  });
}

timeSlider.addEventListener("input", updateTimestamp);

toggleTimeSliderButton.addEventListener("click", () => {
  if (timeSliderSettings.style.display === "none") {
    timeSliderSettings.style.display = "block";
  } else {
    timeSliderSettings.style.display = "none";
    showAllPositions();
  }
});