// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');
    const classSelector = document.querySelectorAll('input[name="class"]');
    const tripSelector = document.querySelectorAll('input[name="roundtrip"]');

    let airportData = []; // Store airport data locally

    // More precise Earth radius in miles
    const EARTH_RADIUS = 3958.7613;

    // Convert degrees to radians
    const toRadians = (value) => (value * Math.PI) / 180;

    // Haversine formula to calculate great-circle distance
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const lat1Rad = toRadians(lat1);
        const lat2Rad = toRadians(lat2);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // Distance in miles
    }

    // Fetch airport data once on page load
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Update the calculation for distance, carbon output, and panels needed
    async function updateCalculation() {
        if (!airportData || airportData.length === 0) {
            console.error('Airport data not loaded.');
            return;
        }

        const originCode = originDropdown.value.trim();
        const destinationCode = destinationDropdown.value.trim();

        // Validate dropdown selections
        if (!originCode || originCode === 'placeholder-origin' ||
            !destinationCode || destinationCode === 'placeholder-destination') {
            distanceOutput.textContent = 'Please select both airports.';
            carbonOutput.textContent = '';
            panelsOutput.textContent = '';
            return;
        }

        // Find the selected airports
        const origin = airportData.find(airport => airport.IATA === originCode);
        const destination = airportData.find(airport => airport.IATA === destinationCode);

        if (!origin || !destination) {
            distanceOutput.textContent = 'Invalid airport selections.';
            carbonOutput.textContent = '';
            panelsOutput.textContent = '';
            return;
        }

        // Get selected flight class
        const selectedClass = [...classSelector].find(radio => radio.checked);
        const emissionsFactor = selectedClass ? parseFloat(selectedClass.value) : 0.15; // Default to Coach

        // Get selected trip type
        const selectedTrip = [...tripSelector].find(radio => radio.checked);
        const isRoundTrip = selectedTrip ? selectedTrip.value === 'roundtrip' : true; // Default to Round Trip

        // Calculate distance
        const distance = calculateDistance(
            parseFloat(origin.Latitude),
            parseFloat(origin.Longitude),
            parseFloat(destination.Latitude),
            parseFloat(destination.Longitude)
        );

        // Calculate carbon emissions and panels needed
        let carbonEmissionsLbs = distance * emissionsFactor * 2.20462; // Convert kg to lbs
        if (isRoundTrip) {
            carbonEmissionsLbs *= 2; // Double for round trip
        }

        const panelOffset = Math.ceil(carbonEmissionsLbs / 530); // 530 lbs offset per panel

        // Update text outputs
        distanceOutput.textContent = `Distance: ${distance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
        panelsOutput.textContent = `Panels Required to Offset: ${panelOffset}`;
    }

    // Attach event listeners
    originDropdown.addEventListener('change', updateCalculation);
    destinationDropdown.addEventListener('change', updateCalculation);
    classSelector.forEach(radio => radio.addEventListener('change', updateCalculation));
    tripSelector.forEach(radio => radio.addEventListener('change', updateCalculation));

    // Fetch airport data on page load
    fetchAirportData();
});
