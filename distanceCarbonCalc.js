// This script calculates the distance between the two selected airports and displays the result
// in the corresponding text boxes in Webflow

// Webflow field IDs
const originFieldId = 'origin-dropdown';
const destinationFieldId = 'destination-dropdown';
const originCoordinatesFieldId = 'Origin-coordinates';
const destinationCoordinatesFieldId = 'Destination-coordinates';
const totalDistanceFieldId = 'Total-distance';

// Function to calculate the distance between two coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Main function to get coordinates and calculate distance
function calculateAndDisplayDistance() {
    const originInput = document.getElementById(originFieldId);
    const destinationInput = document.getElementById(destinationFieldId);

    // Retrieve coordinates from the input elements' data attributes
    const originLatitude = parseFloat(originInput.dataset.latitude);
    const originLongitude = parseFloat(originInput.dataset.longitude);
    const destinationLatitude = parseFloat(destinationInput.dataset.latitude);
    const destinationLongitude = parseFloat(destinationInput.dataset.longitude);

    // Ensure both airports have been selected
    if (!isNaN(originLatitude) && !isNaN(originLongitude) && !isNaN(destinationLatitude) && !isNaN(destinationLongitude)) {
        // Calculate distance
        const distance = calculateDistance(originLatitude, originLongitude, destinationLatitude, destinationLongitude);

        // Display coordinates in the Webflow text boxes
        document.getElementById(originCoordinatesFieldId).textContent = `Lat: ${originLatitude}, Lon: ${originLongitude}`;
        document.getElementById(destinationCoordinatesFieldId).textContent = `Lat: ${destinationLatitude}, Lon: ${destinationLongitude}`;

        // Display distance in the Webflow text box
        document.getElementById(totalDistanceFieldId).textContent = `${distance.toFixed(2)} km`;
    } else {
        console.log('Please select both origin and destination airports.');
    }
}

// Event listeners for when the user selects an airport
document.getElementById(originFieldId).addEventListener('change', calculateAndDisplayDistance);
document.getElementById(destinationFieldId).addEventListener('change', calculateAndDisplayDistance);
