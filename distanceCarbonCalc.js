document.addEventListener('DOMContentLoaded', async function () {
    const originInput = document.getElementById('origin-dropdown');
    const destinationInput = document.getElementById('destination-dropdown');
    const originResults = document.getElementById('origin-results');
    const destinationResults = document.getElementById('destination-results');

    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');
    const classSelector = document.querySelectorAll('input[name="class"]');
    const tripCheckbox = document.getElementById('roundtrip-checkbox');

    const EARTH_RADIUS = 3958.8; // Radius of the Earth in miles
    let airportData = [];

    // Fetch and parse airport data from CSV
    async function fetchAirportData() {
        try {
            const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
            const csvText = await response.text();
            const rows = csvText.split('\n').slice(1); // Skip header row
            airportData = rows.map(row => {
                const columns = row.split(',');
                return {
                    Name: columns[3]?.replace(/"/g, ''),
                    City: columns[10]?.replace(/"/g, ''),
                    IATA: columns[13]?.replace(/"/g, ''),
                    Latitude: parseFloat(columns[4]),
                    Longitude: parseFloat(columns[5])
                };
            }).filter(airport => airport.IATA); // Only include airports with IATA codes
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Calculate distance using the Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const toRadians = (degrees) => (degrees * Math.PI) / 180;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c; // Distance in miles
    }

    // Perform calculations and update results
    function updateCalculations() {
        const originCode = originInput.dataset.iata;
        const destinationCode = destinationInput.dataset.iata;

        if (!originCode || !destinationCode) {
            distanceOutput.textContent = 'Please select both airports.';
            carbonOutput.textContent = 'Carbon Output: N/A';
            panelsOutput.textContent = 'Panels Required to Offset: N/A';
            return;
        }

        const origin = airportData.find(airport => airport.IATA === originCode);
        const destination = airportData.find(airport => airport.IATA === destinationCode);

        if (!origin || !destination) {
            distanceOutput.textContent = 'Invalid airport selection.';
            carbonOutput.textContent = 'Carbon Output: N/A';
            panelsOutput.textContent = 'Panels Required to Offset: N/A';
            return;
        }

        const selectedClass = [...classSelector].find(radio => radio.checked);
        const emissionsFactor = selectedClass ? parseFloat(selectedClass.value) : 0.15; // Default to coach

        const isRoundTrip = tripCheckbox.checked;

        const distance = calculateDistance(
            origin.Latitude,
            origin.Longitude,
            destination.Latitude,
            destination.Longitude
        );

        const totalDistance = isRoundTrip ? distance * 2 : distance;
        const carbonEmissionsLbs = totalDistance * emissionsFactor * 2.20462;
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530);

        // Update the results in the UI
        distanceOutput.textContent = `Distance: ${totalDistance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
        panelsOutput.textContent = `Panels Required to Offset: ${panelOffset}`;
    }

    // Add event listeners for input changes
    originInput.addEventListener('input', () => updateCalculations());
    destinationInput.addEventListener('input', () => updateCalculations());
    classSelector.forEach(radio => radio.addEventListener('change', updateCalculations));
    tripCheckbox.addEventListener('change', updateCalculations);

    // Initialize the output placeholders
    distanceOutput.textContent = 'Please select both airports.';
    carbonOutput.textContent = 'Carbon Output: N/A';
    panelsOutput.textContent = 'Panels Required to Offset: N/A';

    // Fetch airport data on load
    await fetchAirportData();
});
