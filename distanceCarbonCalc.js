document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");
    const roundTripCheckbox = document.getElementById("roundtrip-checkbox");
    const flightClassRadios = document.querySelectorAll("input[name='class']");

    const originCoordinatesField = document.getElementById("Origin-coordinates");
    const destinationCoordinatesField = document.getElementById("Destination-coordinates");
    const totalMilesField = document.getElementById("Total-miles");
    const carbonCostField = document.getElementById("carbon-cost");
    const panelsToOffsetField = document.getElementById("panels-to-offset");

    let originMarker, destinationMarker;
    let lastFlyToCenter = null;

    mapboxgl.accessToken = 'pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay',
        center: [0, 0],
        zoom: 2 // Fixed zoom level
    });

    // Disable zoom interaction
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();

    async function fetchAirportData() {
        try {
            const response = await fetch("https://davidmegginson.github.io/ourairports-data/airports.csv");
            const data = await response.text();
            return parseCSV(data);
        } catch (error) {
            console.error("Error fetching airport data:", error);
            return [];
        }
    }

    function parseCSV(data) {
        const lines = data.split("\n");
        const airports = [];
        for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split(",");
            if (fields[2] === '"large_airport"' && fields[13]) {
                airports.push({
                    name: fields[3].replace(/"/g, ""),
                    municipality: fields[10].replace(/"/g, ""),
                    iata_code: fields[13].replace(/"/g, ""),
                    latitude: parseFloat(fields[4]),
                    longitude: parseFloat(fields[5])
                });
            }
        }
        return airports;
    }

    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 3958.8; // Radius of the Earth in miles
        const toRadians = degrees => degrees * (Math.PI / 180);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function calculateMetrics(origin, destination, isRoundTrip, flightClassCarbonCost) {
        const distance = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
        const roundTripMultiplier = isRoundTrip ? 2 : 1;
        const totalDistance = distance * roundTripMultiplier;

        const carbonCost = totalDistance * flightClassCarbonCost;
        const panelsNeeded = Math.ceil(carbonCost / 530); // Corrected calculation

        return { totalDistance, carbonCost, panelsNeeded };
    }

    function updateFields(metrics, origin, destination) {
        if (origin) {
            originCoordinatesField.textContent = `${origin.latitude}, ${origin.longitude}`;
        }
        if (destination) {
            destinationCoordinatesField.textContent = `${destination.latitude}, ${destination.longitude}`;
        }

        if (metrics) {
            totalMilesField.textContent = `${metrics.totalDistance.toFixed(2)} miles`; // Add units
            carbonCostField.textContent = `${metrics.carbonCost.toFixed(2)} lbs CO₂`; // Add units
            panelsToOffsetField.textContent = metrics.panelsNeeded;

            // Calculate and display the total cost
            const totalCost = metrics.panelsNeeded * 25;
            const totalCostField = document.getElementById('total-cost');
            if (totalCostField) {
                totalCostField.textContent = `$${totalCost}`;
            }
        }
    }

    function updateMap(origin, destination) {
        if (origin) {
            if (originMarker) originMarker.remove();
            originMarker = new mapboxgl.Marker({ color: '#0F4C81' })
                .setLngLat([origin.longitude, origin.latitude])
                .addTo(map);
        }

        if (destination) {
            if (destinationMarker) destinationMarker.remove();
            destinationMarker = new mapboxgl.Marker({ color: '#0F4C81' })
                .setLngLat([destination.longitude, destination.latitude])
                .addTo(map);
        }

        let flyToCenter = null;
        if (origin && destination) {
            const midLongitude = (origin.longitude + destination.longitude) / 2;
            const midLatitude = (origin.latitude + destination.latitude) / 2;
            flyToCenter = [midLongitude, midLatitude];

            if (map.getSource('flight-path')) {
                map.removeLayer('flight-path');
                map.removeSource('flight-path');
            }

            map.addSource('flight-path', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [origin.longitude, origin.latitude],
                            [destination.longitude, destination.latitude]
                        ]
                    }
                }
            });

            map.addLayer({
                id: 'flight-path',
                type: 'line',
                source: 'flight-path',
                layout: {},
                paint: {
                    'line-color': '#30A462',
                    'line-width': 4
                }
            });
        } else if (origin) {
            flyToCenter = [origin.longitude, origin.latitude];
        } else if (destination) {
            flyToCenter = [destination.longitude, destination.latitude];
        }

        if (flyToCenter && (!lastFlyToCenter || flyToCenter[0] !== lastFlyToCenter[0] || flyToCenter[1] !== lastFlyToCenter[1])) {
            lastFlyToCenter = flyToCenter;
            map.easeTo({ center: flyToCenter, zoom: 2, essential: true }); // Smooth easing animation
        }
    }

    const airportData = await fetchAirportData();

    function handleSelectionChange() {
        const originIATA = originDropdown.dataset.iataCode;
        const destinationIATA = destinationDropdown.dataset.iataCode;
        const isRoundTrip = !roundTripCheckbox.checked;

        const flightClassCarbonCost = parseFloat(Array.from(flightClassRadios).find(radio => radio.checked)?.value || 0.15);

        const origin = originIATA ? airportData.find(airport => airport.iata_code === originIATA) : null;
        const destination = destinationIATA ? airportData.find(airport => airport.iata_code === destinationIATA) : null;

        const metrics = origin && destination ? calculateMetrics(origin, destination, isRoundTrip, flightClassCarbonCost) : null;
        updateFields(metrics, origin, destination);
        updateMap(origin, destination);
    }

    attachDropdown(originDropdown, airportData);
    attachDropdown(destinationDropdown, airportData);

    originDropdown.addEventListener("input", handleSelectionChange);
    destinationDropdown.addEventListener("input", handleSelectionChange);
    roundTripCheckbox.addEventListener("change", handleSelectionChange);
    flightClassRadios.forEach(radio => radio.addEventListener("change", handleSelectionChange));

    const goToAppButton = document.getElementById("goToApp");
    goToAppButton.addEventListener("click", function () {
        const panelsNeeded = parseInt(panelsToOffsetField.textContent, 10);
        if (!isNaN(panelsNeeded) && panelsNeeded > 0) {
            const appUrl = `https://app.renewables.org/?quantity=${panelsNeeded}`;
            window.location.href = appUrl;
        } else {
            alert("Please calculate the required panels first.");
        }
    });

    handleSelectionChange();
});
