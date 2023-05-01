// Heatmap
let heatmapLayer;
let heatmapVisible = false;

function createHeatmap(radius, blur) {
  const heatmapData = participant_positions.map(([_, lat, lng]) => [lat, lng, 0.5]);
  heatmapLayer = L.heatLayer(heatmapData, {
    radius: radius,
    blur: blur,
    maxZoom: 15,
  });
}

function toggleHeatmap() {
  const heatmapSettings = document.getElementById("heatmap-settings");
  
  if (!heatmapVisible) {
    heatmapLayer.addTo(map);
    heatmapSettings.style.display = "block";
  } else {
    map.removeLayer(heatmapLayer);
    heatmapSettings.style.display = "none";
  }
  heatmapVisible = !heatmapVisible;
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

  if (heatmapVisible) {
    map.removeLayer(heatmapLayer);
  }
  createHeatmap(radius, blur);
  if (heatmapVisible) {
    heatmapLayer.addTo(map);
  }
}

radiusValue.textContent = radiusSlider.value;
blurValue.textContent = blurSlider.value;

radiusSlider.addEventListener("input", updateHeatmap);
blurSlider.addEventListener("input", updateHeatmap);

// Initialize the heatmap with the initial slider values
createHeatmap(parseInt(radiusSlider.value), parseInt(blurSlider.value));
document.getElementById("toggle-grid").addEventListener("click", toggleHeatmap); // Update the event listener to toggleHeatmap
