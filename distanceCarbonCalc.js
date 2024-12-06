// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    const distanceOutput = document.getElementById('distance-output');
    const carbonOutput = document.getElementById('carbon-output');
    const panelsOutput = document.getElementById('panels-to-offset');
    const classSelector = document.querySelectorAll('input[name="class"]');
    const roundTripCheckbox = document.getElementById('roundtrip-checkbox');
    const tripCheckbox = document.getElementById('roundtrip-checkbox'); // The checkbox for trip type

    let airportData = [];
    const EARTH_RADIUS = 3958.8; // Radius of Earth in miles
@@ -66,19 +65,17 @@ document.addEventListener('DOMContentLoaded', function () {
        const selectedClass = [...classSelector].find(radio => radio.checked);
        const emissionsFactor = selectedClass ? parseFloat(selectedClass.value) : 0.15; // Default to Coach

        // Determine if the trip is round trip based on checkbox
        const isRoundTrip = roundTripCheckbox.checked;
        const isOneWay = tripCheckbox.checked; // Checkbox checked means "One Way"
        const distance = calculateDistance(
            parseFloat(origin.Latitude),
            parseFloat(origin.Longitude),
            parseFloat(destination.Latitude),
            parseFloat(destination.Longitude)
        );

        const totalDistance = isRoundTrip ? distance * 2 : distance;
        const carbonEmissionsLbs = totalDistance * emissionsFactor * 2.20462;
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530);
        const totalDistance = isOneWay ? distance : distance * 2; // Double for round trip if unchecked
        const carbonEmissionsLbs = totalDistance * emissionsFactor * 2.20462; // Convert to pounds
        const panelOffset = Math.ceil(carbonEmissionsLbs / 530); // Calculate panel offset

        distanceOutput.textContent = `Distance: ${totalDistance.toFixed(2)} miles`;
        carbonOutput.textContent = `Carbon Output: ${carbonEmissionsLbs.toFixed(2)} lbs CO₂`;
@@ -89,8 +86,7 @@ document.addEventListener('DOMContentLoaded', function () {
    originDropdown.addEventListener('change', updateCalculation);
    destinationDropdown.addEventListener('change', updateCalculation);
    classSelector.forEach(radio => radio.addEventListener('change', updateCalculation));
    roundTripCheckbox.addEventListener('change', updateCalculation);
    tripCheckbox.addEventListener('change', updateCalculation); // Trigger update when checkbox is toggled

    // Fetch airport data
    fetchAirportData();
});
