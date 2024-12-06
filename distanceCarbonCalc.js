// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');

    const EARTH_RADIUS = 3958.8; // Miles

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

    // Update calculations
    function updateCalculation() {
        const originLat = parseFloat(document.getElementById('origin-dropdown').getAttribute('data-latitude'));
        const originLng = parseFloat(document.getElementById('origin-dropdown').getAttribute('data-longitude'));
        const destinationLat = parseFloat(document.getElementById('destination-dropdown').getAttribute('data-latitude'));
        const destinationLng = parseFloat(document.getElementById('destination-dropdown').getAttribute('data-longitude'));

        if (isNaN(originLat) || isNaN(destinationLat)) {
            distanceOutput.textContent = 'Please select both airports.';
            carbonOutput.textContent = '';
            panelsOutput.textContent = '';
            return;
        }

        const distance = calculateDistance(originLat, originLng, destinationLat, destinationLng);
        const carbonEmissionsLbs = distance * 0.15 * 2.20462; // Default emissions factor for Coach
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530);

        distanceOutput.textContent = `Distance: ${distance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
        panelsOutput.textContent = `Panels Required to Offset: ${panelOffset}`;
    }

    // Attach event listeners
    document.getElementById('origin-dropdown').addEventListener('change', updateCalculation);
    document.getElementById('destination-dropdown').addEventListener('change', updateCalculation);
});
