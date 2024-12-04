 // Initialize Mapbox
document.addEventListener('DOMContentLoaded', async function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg'; // Your access token

    const map = new mapboxgl.Map({
        container: 'map', // The ID of the div where the map will be rendered
        style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay', // Your custom styling
        center: [-98.5795, 39.8283], // Default center (USA)
        zoom: 3 // Default zoom level
    });

    // Store airport data
    let airportData = [];

    // Fetch airport data
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    await fetchAirportData();

    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');

    let originMarker, destinationMarker, flightPath;

    // Function to add a marker to the map
    function addMarker(lng, lat, color) {
        return new mapboxgl.Marker({ color })
            .setLngLat([lng, lat])
            .addTo(map);
    }

    // Function to draw a line between two points
    function drawLine(coords) {
        if (map.getSource('flightPath')) {
            map.getSource('flightPath').setData({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: coords
                }
            });
        } else {
            map.addSource('flightPath', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: coords
                    }
                }
            });
            map.addLayer({
                id: 'flightPath',
                type: 'line',
                source: 'flightPath',
                layout: {},
                paint: {
                    'line-color': '#FF0000', // Red line for the path
                    'line-width': 3 // Width of the line
                }
            });
        }
    }

    // Update map based on user selections
    function updateMap() {
        const originCode = originDropdown.value.trim();
        const destinationCode = destinationDropdown.value.trim();

        if (!airportData || airportData.length === 0) return;

        const origin = airportData.find(airport => airport.IATA === originCode);
        const destination = airportData.find(airport => airport.IATA === destinationCode);

        if (origin) {
            if (originMarker) originMarker.remove();
            originMarker = addMarker(origin.Longitude, origin.Latitude, '#008000'); // Green for origin
            map.flyTo({ center: [origin.Longitude, origin.Latitude], zoom: 5 });
        }

        if (destination) {
            if (destinationMarker) destinationMarker.remove();
            destinationMarker = addMarker(destination.Longitude, destination.Latitude, '#0000FF'); // Blue for destination
        }

        if (origin && destination) {
            const coords = [
                [origin.Longitude, origin.Latitude],
                [destination.Longitude, destination.Latitude]
            ];
            drawLine(coords);
        }
    }

    // Attach event listeners to dropdowns
    originDropdown.addEventListener('change', updateMap);
    destinationDropdown.addEventListener('change', updateMap);
});
