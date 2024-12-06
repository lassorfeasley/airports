document.addEventListener('DOMContentLoaded', async function () {
    const originInput = document.getElementById('origin-dropdown');
    const destinationInput = document.getElementById('destination-dropdown');
    const originDropdown = document.createElement('div');
    const destinationDropdown = document.createElement('div');

    // Dropdown styles
    originDropdown.style.position = "absolute";
    originDropdown.style.zIndex = "10";
    originDropdown.style.background = "#fff";
    originDropdown.style.border = "1px solid #ccc";
    originDropdown.style.borderRadius = "10px";
    originDropdown.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    originDropdown.style.width = "100%";
    originDropdown.style.maxHeight = "200px";
    originDropdown.style.overflowY = "auto";
    originDropdown.style.display = "none";

    destinationDropdown.style.position = "absolute";
    destinationDropdown.style.zIndex = "10";
    destinationDropdown.style.background = "#fff";
    destinationDropdown.style.border = "1px solid #ccc";
    destinationDropdown.style.borderRadius = "10px";
    destinationDropdown.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    destinationDropdown.style.width = "100%";
    destinationDropdown.style.maxHeight = "200px";
    destinationDropdown.style.overflowY = "auto";
    destinationDropdown.style.display = "none";

    originInput.parentNode.insertBefore(originDropdown, originInput.nextSibling);
    destinationInput.parentNode.insertBefore(destinationDropdown, destinationInput.nextSibling);

    let airportData = [];

    // Fetch and parse CSV
    async function fetchAirportData() {
        try {
            const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
            const text = await response.text();
            const rows = text.split('\n').slice(1); // Skip header row
            airportData = rows.map(row => {
                const columns = row.split(',');
                return {
                    AirportName: columns[3]?.replace(/"/g, '').trim(), // Name
                    City: columns[10]?.replace(/"/g, '').trim(), // Municipality
                    IATA: columns[13]?.replace(/"/g, '').trim(), // IATA Code
                    Latitude: parseFloat(columns[4]), // Latitude
                    Longitude: parseFloat(columns[5]) // Longitude
                };
            }).filter(airport => airport.IATA && airport.City); // Only valid airports
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Filter airports and update dropdown
    function filterAirports(input, dropdown, query) {
        dropdown.innerHTML = '';
        const filteredAirports = airportData.filter(airport =>
            airport.AirportName.toLowerCase().includes(query.toLowerCase()) ||
            airport.City.toLowerCase().includes(query.toLowerCase()) ||
            airport.IATA.toLowerCase().includes(query.toLowerCase())
        );

        filteredAirports.forEach(airport => {
            const option = document.createElement('div');
            option.textContent = `${airport.AirportName} (${airport.IATA}) - ${airport.City}`;
            option.style.padding = "8px";
            option.style.cursor = "pointer";
            option.style.borderBottom = "1px solid #eee";

            option.addEventListener('click', () => {
                input.value = `${airport.AirportName} (${airport.IATA})`;
                input.setAttribute('data-latitude', airport.Latitude);
                input.setAttribute('data-longitude', airport.Longitude);
                dropdown.style.display = 'none';
                updateMap();
            });

            dropdown.appendChild(option);
        });

        dropdown.style.display = filteredAirports.length ? 'block' : 'none';
    }

// Update the map
function updateMap() {
    const originLat = parseFloat(originInput.getAttribute('data-latitude'));
    const originLng = parseFloat(originInput.getAttribute('data-longitude'));
    const destinationLat = parseFloat(destinationInput.getAttribute('data-latitude'));
    const destinationLng = parseFloat(destinationInput.getAttribute('data-longitude'));

    if (!isNaN(originLat) && !isNaN(destinationLat)) {
        drawRoute(originLat, originLng, destinationLat, destinationLng);
        // Trigger the function to update other outputs here if needed
    }
}

// Attach input events
originInput.addEventListener('input', () => {
    filterAirports(originInput, originDropdown, originInput.value);
    updateMap(); // Ensure map and outputs update after changing origin
});

destinationInput.addEventListener('input', () => {
    filterAirports(destinationInput, destinationDropdown, destinationInput.value);
    updateMap(); // Ensure map and outputs update after changing destination
});

    // Draw route on map
    function drawRoute(lat1, lng1, lat2, lng2) {
        if (map.getLayer('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        const route = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[lng1, lat1], [lng2, lat2]]
            }
        };

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
    }

    // Attach input events
    originInput.addEventListener('input', () => {
        filterAirports(originInput, originDropdown, originInput.value);
    });

    destinationInput.addEventListener('input', () => {
        filterAirports(destinationInput, destinationDropdown, destinationInput.value);
    });

    originInput.addEventListener('blur', () => {
        setTimeout(() => originDropdown.style.display = 'none', 200);
    });

    destinationInput.addEventListener('blur', () => {
        setTimeout(() => destinationDropdown.style.display = 'none', 200);
    });

    await fetchAirportData();
});
