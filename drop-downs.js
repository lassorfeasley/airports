// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');

    // Initialize Choices.js for the dropdowns
    const originChoices = new Choices(originDropdown, {
        searchEnabled: true,
        itemSelectText: '',
    });

    const destinationChoices = new Choices(destinationDropdown, {
        searchEnabled: true,
        itemSelectText: '',
    });

    // Fetch the JSON file
    fetch('https://lassorfeasley.github.io/airports/airports.json')
        .then(response => response.json())
        .then(data => {
            // Populate dropdowns with airport data
            const options = data.map(airport => ({
                value: airport.IATA, // Use IATA code as the value
                label: `${airport.Name} (${airport.IATA})`,
            }));

            // Set options dynamically in Choices.js
            originChoices.setChoices(options, 'value', 'label', true);
            destinationChoices.setChoices(options, 'value', 'label', true);
        })
        .catch(error => console.error('Error fetching airports data:', error));

    // Ensure the dropdowns have the correct z-index
    function setDropdownStyles() {
        originDropdown.parentNode.style.zIndex = '10';
        destinationDropdown.parentNode.style.zIndex = '10';
    }

    // Set styles on load
    setDropdownStyles();
});
