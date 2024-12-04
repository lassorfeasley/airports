// Initialize Mapbox
document.addEventListener('DOMContentLoaded', async function () {
    mapboxgl.accessToken = 'your-mapbox-access-token'; // Replace with your Mapbox token

    const map = new mapboxgl.Map({
        container: 'map', // The ID of the div where the map will be rendered
        style: 'mapbox://styles/your-username/your-style-id', // Replace with your preferred styling
        center: [-98.5795, 39.8283], // Default center (USA)
        zoom: 3 // Default zoom
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
                    'line-color': '#FF0000',
                    'line-width': 2
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
