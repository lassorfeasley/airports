// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');

    // Initialize Choices.js for the dropdowns
    const originChoices = new Choices(originDropdown, {
        searchEnabled: true,
        itemSelectText: '',
        placeholder: true,
        placeholderValue: 'Type to search for an airport...',
        shouldSort: false,
        noResultsText: 'No airports found',
        noChoicesText: 'Type to search for an airport...',
        resetScrollPosition: true,
    });

    const destinationChoices = new Choices(destinationDropdown, {
        searchEnabled: true,
        itemSelectText: '',
        placeholder: true,
        placeholderValue: 'Type to search for an airport...',
        shouldSort: false,
        noResultsText: 'No airports found',
        noChoicesText: 'Type to search for an airport...',
        resetScrollPosition: true,
    });

    // Fetch the JSON file
    fetch('https://lassorfeasley.github.io/airports/airports.json')
        .then(response => response.json())
        .then(data => {
            // Format the airport data as choices
            const airportOptions = data.map(airport => ({
                value: airport.IATA, // Use IATA code as the value
                label: `${airport.Name} (${airport.IATA})`,
            }));

            // Dynamically populate the dropdowns when the user types
            originDropdown.addEventListener('search', () => {
                originChoices.setChoices(airportOptions, 'value', 'label', true);
            });

            destinationDropdown.addEventListener('search', () => {
                destinationChoices.setChoices(airportOptions, 'value', 'label', true);
            });
        })
        .catch(error => console.error('Error fetching airports data:', error));

    // Ensure the dropdowns have the correct z-index
    function setDropdownStyles() {
        const dropdownWrappers = document.querySelectorAll('.choices__list--dropdown');
        dropdownWrappers.forEach(wrapper => {
            wrapper.style.zIndex = '10';
        });
    }

    // Observe DOM changes to ensure z-index styling is applied to dropdowns dynamically
    const observer = new MutationObserver(setDropdownStyles);
    observer.observe(document.body, { childList: true, subtree: true });

    // Apply styles on load
    setDropdownStyles();
});
