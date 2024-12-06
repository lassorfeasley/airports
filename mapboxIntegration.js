mapboxgl.accessToken = 'pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg';

const map = new mapboxgl.Map({
    container: 'map', // ID of the div block containing the map
    style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay', // Your custom Mapbox style
    center: [0, 20], // Centered for a global view
    zoom: 1.5, // Adjust initial zoom level
    projection: 'equirectangular' // Set projection to Equirectangular
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

    // Define the full route coordinates
    const routeCoordinates = [
        [origin.Longitude, origin.Latitude],
        [destination.Longitude, destination.Latitude]
    ];

    // Initialize the animated route with only the origin point
    const animatedRoute = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [routeCoordinates[0]] // Start with the origin only
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
    animateLine(routeCoordinates, animatedRoute);
}

// Function to animate the line
function animateLine(routeCoordinates, animatedRoute) {
    let progress = 0; // Animation progress

    function frame() {
        progress += 0.01; // Increase progress
        if (progress > 1) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // Calculate the current interpolated point along the line
        const interpolatedPoint = interpolateCoordinates(routeCoordinates[0], routeCoordinates[1], progress);

        // Update the line's coordinates
        animatedRoute.geometry.coordinates.push(interpolatedPoint);
        map.getSource('route').setData(animatedRoute);

        animationFrameId = requestAnimationFrame(frame);
    }

    frame(); // Start animation
}

// Function to interpolate between two points
function interpolateCoordinates(start, end, t) {
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;
    return [lng, lat];
}

// Call updateMap when airports are selected
document.addEventListener('change', async function () {
    const originCode = document.getElementById('origin-dropdown').value.trim();
    const destinationCode = document.getElementById('destination-dropdown').value.trim();

    if (originCode && destinationCode) {
        const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
        const csvText = await response.text();

        // Parse CSV data
        const rows = csvText.split('\n').slice(1); // Skip header
        const airportData = rows.map(row => {
            const columns = row.split(',');
            return {
                Name: columns[3]?.replace(/"/g, ''), // Airport name
                City: columns[10]?.replace(/"/g, ''), // City
                IATA: columns[13]?.replace(/"/g, ''), // IATA code
                Latitude: parseFloat(columns[4]), // Latitude
                Longitude: parseFloat(columns[5]) // Longitude
            };
        });

        // Find origin and destination airports
        const origin = airportData.find(airport => airport.IATA === originCode);
        const destination = airportData.find(airport => airport.IATA === destinationCode);

        if (origin && destination) {
            updateMap(origin, destination);
        }
    }
});
