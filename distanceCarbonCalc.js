document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');
    const classSelector = document.querySelectorAll('input[name="class"]');
    const tripCheckbox = document.getElementById('roundtrip-checkbox'); // The checkbox for trip type

    let airportData = [];
    const EARTH_RADIUS = 3958.8; // Radius of Earth in miles

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

        const isOneWay = tripCheckbox.checked; // Checkbox checked means "One Way"
        const distance = calculateDistance(
            parseFloat(origin.Latitude),
            parseFloat(origin.Longitude),
            parseFloat(destination.Latitude),
            parseFloat(destination.Longitude)
        );

        const totalDistance = isOneWay ? distance : distance * 2; // Double for round trip if unchecked
        const carbonEmissionsLbs = totalDistance * emissionsFactor * 2.20462; // Convert to pounds
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530); // Calculate panel offset

        distanceOutput.textContent = `Distance: ${totalDistance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
        panelsOutput.textContent = `Panels Required to Offset: ${panelOffset}`;
    }

    // Attach event listeners
    originDropdown.addEventListener('change', updateCalculation);
    destinationDropdown.addEventListener('change', updateCalculation);
    classSelector.forEach(radio => radio.addEventListener('change', updateCalculation));
    tripCheckbox.addEventListener('change', updateCalculation); // Trigger update when checkbox is toggled

    fetchAirportData();
});
