mapboxgl.accessToken = 'pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div block containing the map
    style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay',
    center: [-98, 39], // Center of the USA
    zoom: 3
});

// Store markers and line layer globally
let originMarker = null;
let destinationMarker = null;
let animationFrameId;

// Function to add markers and animate the line
function updateMap(origin, destination) {
    // Clear existing markers and line
    if (originMarker) originMarker.remove();
    if (destinationMarker) destinationMarker.remove();
    if (map.getSource('route')) map.removeLayer('route').removeSource('route');

    // Add markers for the airports
    originMarker = new mapboxgl.Marker({ color: 'green' }).setLngLat([origin.Longitude, origin.Latitude]).addTo(map);
    destinationMarker = new mapboxgl.Marker({ color: 'blue' }).setLngLat([destination.Longitude, destination.Latitude]).addTo(map);

    // Define the GeoJSON line data
    const route = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [
                [origin.Longitude, origin.Latitude],
                [destination.Longitude, destination.Latitude]
            ]
        }
    };

    // Add the line to the map
    map.addSource('route', {
        type: 'geojson',
        data: route
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {},
        paint: {
            'line-color': '#ff0000',
            'line-width': 4,
            'line-opacity': 0.8
        }
    });

    // Animate the line
    animateLine();
}

// Function to animate the line
function animateLine() {
    let progress = 0; // Line animation progress

    function frame() {
        progress += 0.01; // Increase progress
        if (progress > 1) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // Update the line with the progress
        map.setPaintProperty('route', 'line-gradient', [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0, 'rgba(0, 255, 0, 0)', // Start transparent
            progress, 'rgba(255, 0, 0, 1)', // Gradually appear
            1, 'rgba(255, 0, 0, 1)' // End fully visible
        ]);

        animationFrameId = requestAnimationFrame(frame);
    }

    frame(); // Start animation
}

// Call updateMap when airports are selected
document.addEventListener('change', async function () {
    const originCode = document.getElementById('origin-dropdown').value.trim();
    const destinationCode = document.getElementById('destination-dropdown').value.trim();

    if (originCode && destinationCode) {
        const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
        const airportData = await response.json();

        const origin = airportData.find(airport => airport.IATA === originCode);
        const destination = airportData.find(airport => airport.IATA === destinationCode);

        if (origin && destination) {
            updateMap(origin, destination);
        }
    }
});
