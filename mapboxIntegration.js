mapboxgl.accessToken = 'pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div block containing the map
    style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay',
    center: [-98, 39], // Center of the USA
    zoom: 3
});

// Cache airport data and other variables
let airportData = null;
let originMarker = null;
let destinationMarker = null;
let animationFrameId;

// Fetch airport data once
async function fetchAirportData() {
    if (!airportData) {
        const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
        airportData = await response.json();
    }
    return airportData;
}

// Function to add markers and animate the line
function updateMap(origin, destination) {
    // Clear existing markers and line
    if (originMarker) originMarker.remove();
    if (destinationMarker) destinationMarker.remove();
    if (map.getSource('route')) map.removeLayer('route').removeSource('route');

    // Add markers for the airports
    originMarker = new mapboxgl.Marker({ color: 'green' })
        .setLngLat([origin.Longitude, origin.Latitude])
        .addTo(map);
    destinationMarker = new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([destination.Longitude, destination.Latitude])
        .addTo(map);

    // Define route coordinates
    const routeCoordinates = [
        [origin.Longitude, origin.Latitude],
        [destination.Longitude, destination.Latitude]
    ];

    // Precompute interpolated points using Turf.js
    const line = turf.lineString(routeCoordinates);
    const distance = turf.length(line); // Calculate total length in kilometers
    const steps = 500; // Number of animation steps
    const points = [];
    for (let i = 0; i <= steps; i++) {
        points.push(turf.along(line, (distance / steps) * i).geometry.coordinates);
    }

    // Initialize the animated route
    const animatedRoute = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [] // Start with an empty line
        }
    };

    // Add the animated route source to the map
    map.addSource('route', {
        type: 'geojson',
        data: animatedRoute
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
    animateLine(points, animatedRoute);
}

// Function to animate the line
function animateLine(points, animatedRoute) {
    let index = 0;

    function frame() {
        if (index >= points.length) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // Update the line with the next point
        animatedRoute.geometry.coordinates.push(points[index]);
        map.getSource('route').setData(animatedRoute);
        index++;
        animationFrameId = requestAnimationFrame(frame);
    }

    frame(); // Start the animation
}

// Event handler for dropdown changes
async function handleAirportChange() {
    const originCode = document.getElementById('origin-dropdown').value.trim();
    const destinationCode = document.getElementById('destination-dropdown').value.trim();

    if (originCode && destinationCode) {
        const data = await fetchAirportData();
        const origin = data.find(airport => airport.IATA === originCode);
        const destination = data.find(airport => airport.IATA === destinationCode);

        if (origin && destination) {
            updateMap(origin, destination);
        }
    }
}

// Attach event listeners to dropdowns
document.getElementById('origin-dropdown').addEventListener('change', handleAirportChange);
document.getElementById('destination-dropdown').addEventListener('change', handleAirportChange);
