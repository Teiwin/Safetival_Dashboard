// over the course of the event:
// compute the density on a "window" minute window
// get the max of this density
// plot the max density over the course of the event

// COMPUTE THE DENSITY

// window parameter slider
const real_participant = 3500;

function calculateIntensity(dataPoints, gridPoints, radius) {
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

function compute_density(time) {
    // get the window value in min and convert it in seconds
    const windowSize = 5 * 60; // 5 min
    
    // get position in the window
    const start = time - windowSize/2;
    const end = time + windowSize/2;
    positions = participant_positions.filter(([timestamp, a, b]) => timestamp >= start && timestamp <= end);

    // get the max density
    var intensities = calculateIntensity(positions, grid, 5);
    // computation of the "Coefficient Pour Tomber Juste"
    const CPTJ_ALEX = 13 * Math.PI * 5**2; // coeficient du célèbre psychologue social ALEXANDRE
    var max_density = Math.max(...intensities) / CPTJ_ALEX;
    var numParticipants = real_participant;
    let participant_ratio = number_of_participants / numParticipants;
    var density_approx = max_density / participant_ratio;

    return density_approx;
}

// plot it:

function calculateCounts() {
    // Initialize an empty object to hold counts
    let counts = {};
  
    // number of point computed
    let n = 500;
  
    // time delta between two points
    let delta = (endTimestamp - startTimestamp) / n;
    
    for (let timestamp = startTimestamp; timestamp < endTimestamp; timestamp += delta) {
      counts[timestamp] = compute_density(timestamp);
    }
    
    // Convert the counts object to an array and return it
    return [Object.values(counts), Object.keys(counts)];
  }

  let [counts, timestamps] = calculateCounts(participant_positions); // function to calculate counts

  let ctx = document.getElementById('positionChart').getContext('2d');
  let positionChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: density_timestamps,
          datasets: [{
              label: 'Maximum density',
              data: density,
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
        responive: true,
        maintainAspectRation: false,
        scales: {
            x: {
                type: 'time',
            }
        }
      }
  });

