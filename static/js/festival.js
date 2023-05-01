const map = L.map("map").fitBounds([
  [{{ min_lat }}, {{ min_lng }}],
  [{{ max_lat }}, {{ max_lng }}]
]);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add participant positions to the map
const participant_positions = {{ participant_positions|safe }};
console.log(participant_positions);
participant_positions.forEach(([lat, lng]) => {
    // Use circleMarker with red color and custom radius
    L.circleMarker([lat, lng], {
      color: 'red',
      fillColor: 'red',
      fillOpacity: 1,
      radius: 5
    }).addTo(map);
  });