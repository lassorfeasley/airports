function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of Earth in miles
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lat2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
}

document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');
    const classSelector = document.querySelectorAll('input[name="class"]'); // Flight class group
    const tripSelector = document.querySelectorAll('input[name="roundtrip"]'); // Round Trip group

    let airportData = []; // Local variable to store airport data

    // Fetch airport data once on page load
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    async function updateCalculation() {
        if (!airportData || airportData.length === 0) {
            console.error('Airport data not loaded.');
            return;
        }

        const originCode = originDropdown.value.trim();
        const destinationCode = destinationDropdown.value.trim();

        // Exclude placeholder options
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

        // Validate that both airports exist in the dataset
        if (!origin || !destination) {
            distanceOutput.textContent = 'Please select valid airports.';
            carbonOutput.textContent = '';
            panelsOutput.textContent = '';
            return;
        }

        // Get selected flight class
        const selectedClass = [...classSelector].find(radio => radio.checked);
        const emissionsFactor = selectedClass ? parseFloat(selectedClass.value) : 0.15; // Default to Coach

        // Get selected trip type
        const selectedTrip = [...tripSelector].find(radio => radio.checked);
        console.log('Selected Trip:', selectedTrip ? selectedTrip.value : 'None');
        const isRoundTrip = selectedTrip ? selectedTrip.value === 'roundtrip' : true; // Default to Round Trip

        // Calculate distance and carbon output
        const distance = calculateDistance(
            parseFloat(origin.Latitude),
            parseFloat(origin.Longitude),
            parseFloat(destination.Latitude),
            parseFloat(destination.Longitude)
        );

        let carbonEmissionsKg = distance * emissionsFactor;
        if (isRoundTrip) {
            carbonEmissionsKg *= 2; // Double for round trip
        }

        const carbonEmissionsLbs = carbonEmissionsKg * 2.20462; // Convert to pounds
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530); // Calculate panels needed

        // Update the text blocks
        distanceOutput.textContent = `Distance: ${distance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
        panelsOutput.textContent = `Panels Required to Offset: ${panelOffset}`;
    }

    // Attach event listeners to dropdowns, flight class, and trip type radio buttons
    originDropdown.addEventListener('change', updateCalculation);
    destinationDropdown.addEventListener('change', updateCalculation);
    classSelector.forEach(radio => {
        radio.addEventListener('change', updateCalculation); // Update on flight class toggle
    });
    tripSelector.forEach(radio => {
        radio.addEventListener('change', updateCalculation); // Update on trip type toggle
    });

    // Debug: Log tripSelector elements
    console.log('Trip Selector Elements:', tripSelector);

    // Fetch airport data once on page load
    fetchAirportData();
});
