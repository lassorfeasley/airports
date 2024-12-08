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
        const R = 6371; // Radius of the Earth in kilometers
        const toRadians = degrees => degrees * (Math.PI / 180);

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    }

    function calculateMetrics(origin, destination, isRoundTrip, flightClassMultiplier) {
        const distance = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
        const roundTripMultiplier = isRoundTrip ? 2 : 1;
        const totalDistance = distance * roundTripMultiplier;

        const carbonCost = totalDistance * flightClassMultiplier;
        const panelsNeeded = carbonCost * 0.01; // Panels needed per kg of CO2

        return { totalDistance, carbonCost, panelsNeeded };
    }

    function updateFields(metrics, origin, destination) {
        originCoordinatesField.value = `${origin.latitude}, ${origin.longitude}`;
        destinationCoordinatesField.value = `${destination.latitude}, ${destination.longitude}`;
        totalMilesField.value = metrics.totalDistance.toFixed(2);
        carbonCostField.value = metrics.carbonCost.toFixed(2);
        panelsToOffsetField.value = metrics.panelsNeeded.toFixed(2);

        console.log("Metrics:", metrics);
    }

    const airportData = await fetchAirportData();

    document.getElementById("calculate-button").addEventListener("click", function () {
        const originIATA = originDropdown.dataset.iataCode;
        const destinationIATA = destinationDropdown.dataset.iataCode;
        const isRoundTrip = roundTripCheckbox.checked;

        const flightClassMultiplier = parseFloat(Array.from(flightClassRadios).find(radio => radio.checked)?.value);

        if (!originIATA || !destinationIATA || isNaN(flightClassMultiplier)) {
            alert("Please make all selections before calculating.");
            return;
        }

        const origin = airportData.find(airport => airport.iata_code === originIATA);
        const destination = airportData.find(airport => airport.iata_code === destinationIATA);

        if (!origin || !destination) {
            alert("Invalid airport selection.");
            return;
        }

        const metrics = calculateMetrics(origin, destination, isRoundTrip, flightClassMultiplier);
        updateFields(metrics, origin, destination);
    });
});
