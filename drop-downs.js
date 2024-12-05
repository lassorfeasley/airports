// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');

    // Fetch the JSON file
    fetch('https://lassorfeasley.github.io/airports/airports.json')
        .then(response => response.json())
        .then(data => {
            // Populate dropdowns with airport data
            data.forEach(airport => {
                const option = document.createElement('option');
                option.value = airport.IATA; // Use IATA code as the value
                option.textContent = `${airport.Name} (${airport.IATA})`;

                // Add the option to both dropdowns
                originDropdown.appendChild(option.cloneNode(true));
                destinationDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching airports data:', error));

    // Ensure the dropdowns have the correct z-index and positioning
    function setDropdownStyles() {
        originDropdown.style.zIndex = '10';
        originDropdown.style.position = 'relative';

        destinationDropdown.style.zIndex = '10';
        destinationDropdown.style.position = 'relative';
    }

    // Set styles on load
    setDropdownStyles();
});
