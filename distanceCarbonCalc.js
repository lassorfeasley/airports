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

    // CO₂ emission constants in lbs per mile
    const CO2_PER_MILE = {
        economy: 0.198,
        business: 0.396,
        first: 0.594
    };

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
        const R = 6371;
        const toRadians = degrees => degrees * (Math.PI / 180);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function calculateMetrics(origin, destination, isRoundTrip, flightClass) {
        const distance = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
        const roundTripMultiplier = isRoundTrip ? 2 : 1;
        const totalDistance = distance * roundTripMultiplier;

        // Use the CO₂ per mile constant for the selected class
        const carbonCost = totalDistance * CO2_PER_MILE[flightClass.toLowerCase()];
        const panelsNeeded = Math.ceil(carbonCost * 0.01);

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
            totalMilesField.textContent = metrics.totalDistance.toFixed(2);
            carbonCostField.textContent = metrics.carbonCost.toFixed(2);
            panelsToOffsetField.textContent = metrics.panelsNeeded;
        }
    }

    function handleSelectionChange() {
        const originIATA = originDropdown.dataset.iataCode;
        const destinationIATA = destinationDropdown.dataset.iataCode;
        const isRoundTrip = roundTripCheckbox.checked;

        const selectedFlightClass = Array.from(flightClassRadios).find(radio => radio.checked)?.value || 'economy';

        const origin = originIATA ? airportData.find(airport => airport.iata_code === originIATA) : null;
        const destination = destinationIATA ? airportData.find(airport => airport.iata_code === destinationIATA) : null;

        const metrics = origin && destination ? calculateMetrics(origin, destination, isRoundTrip, selectedFlightClass) : null;
        updateFields(metrics, origin, destination);
    }

    const airportData = await fetchAirportData();

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
