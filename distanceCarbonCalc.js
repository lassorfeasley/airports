// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');
    const classSelector = document.querySelectorAll('input[name="class"]');
    const tripSelector = document.querySelectorAll('input[name="roundtrip"]');

    let airportData = [];
    const EARTH_RADIUS = 3958.8; // Miles

    // Mapbox setup
    mapboxgl.accessToken = 'your-mapbox-access-token'; // Replace with your Mapbox token
    const map = new mapboxgl.Map({
        container: 'map', // ID of the map div in Webflow
        style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay',
        center: [0, 20], // Centered for a global view
        zoom: 1.5
    });

    // Markers and route line
    let originMarker, destinationMarker, routeLine;

    // Haversine formula for distance calculation
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const toRadians = (value) => (value * Math.PI) / 180;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c; // Distance in miles
    }

    // Draw the great-circle route using Turf.js
    function drawRoute(lat1, lon1, lat2, lon2) {
        if (routeLine) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        // Create a GeoJSON LineString for the route
        const route = turf.greatCircle([lon1, lat1], [lon2, lat2], {
            npoints: 100
        });

        // Add the route to the map
        map.addSource('route', {
            type: 'geojson',
            data: route
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': '#ff0000',
                'line-width': 2
            }
        });

        // Add origin and destination markers
        if (!originMarker) {
            originMarker = new mapboxgl.Marker({ color: 'green' }).setLngLat([lon1, lat1]).addTo(map);
        } else {
            originMarker.setLngLat([lon1, lat1]);
        }

        if (!destinationMarker) {
            destinationMarker = new mapboxgl.Marker({ color: 'blue' }).setLngLat([lon2, lat2]).addTo(map);
        } else {
            destinationMarker.setLngLat([lon2, lat2]);
        }
    }

    // Fetch airport data
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Update calculations
    async function updateCalculation() {
        if (!airportData || airportData.length === 0) {
            console.error('Airport data not loaded.');
            return;
        }

        const originCode = originDropdown.value.trim();
        const destinationCode = destinationDropdown.value.trim();

        if (!originCode || originCode === 'placeholder-origin' ||
            !destinationCode || destinationCode === 'placeholder-destination') {
            distanceOutput.textContent = 'Please select both airports.';
            carbonOutput.textContent = '';
            panelsOutput.textContent = '';
            return;
        }

        const origin = airportData.find(airport => airport.IATA === originCode);
        const destination = airportData.find(airport => airport.IATA === destinationCode);

        if (!origin || !destination) {
            distanceOutput.textContent = 'Invalid airport selections.';
            carbonOutput.textContent = '';
            panelsOutput.textContent = '';
            return;
        }

        const selectedClass = [...classSelector].find(radio => radio.checked);
        const emissionsFactor = selectedClass ? parseFloat(selectedClass.value) : 0.15; // Default to Coach

        const selectedTrip = [...tripSelector].find(radio => radio.checked);
        const isRoundTrip = selectedTrip ? selectedTrip.value === 'roundtrip' : true;

        const distance = calculateDistance(
            parseFloat(origin.Latitude),
            parseFloat(origin.Longitude),
            parseFloat(destination.Latitude),
            parseFloat(destination.Longitude)
        );

        const totalDistance = isRoundTrip ? distance * 2 : distance;
        const carbonEmissionsLbs = totalDistance * emissionsFactor * 2.20462;
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530);

        distanceOutput.textContent = `Distance: ${totalDistance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
        panelsOutput.textContent = `Panels Required to Offset: ${panelOffset}`;

        drawRoute(parseFloat(origin.Latitude), parseFloat(origin.Longitude),
            parseFloat(destination.Latitude), parseFloat(destination.Longitude));
    }

    originDropdown.addEventListener('change', updateCalculation);
    destinationDropdown.addEventListener('change', updateCalculation);
    classSelector.forEach(radio => radio.addEventListener('change', updateCalculation));
    tripSelector.forEach(radio => radio.addEventListener('change', updateCalculation));

    fetchAirportData();
});
