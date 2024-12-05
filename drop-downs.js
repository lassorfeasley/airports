// Wait for the document to load
document.addEventListener('DOMContentLoaded', function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');

    // Save existing options (preset airports)
    const presetOptionsOrigin = Array.from(originDropdown.options).map(option => ({
        value: option.value,
        label: option.textContent,
    }));
    const presetOptionsDestination = Array.from(destinationDropdown.options).map(option => ({
        value: option.value,
        label: option.textContent,
    }));

    // Initialize Choices.js for the dropdowns
    const originChoices = new Choices(originDropdown, {
        searchEnabled: true,
        itemSelectText: '',
        resetScrollPosition: true,
    });

    const destinationChoices = new Choices(destinationDropdown, {
        searchEnabled: true,
        itemSelectText: '',
        resetScrollPosition: true,
    });

    // Fetch the JSON file
    fetch('https://lassorfeasley.github.io/airports/airports.json')
        .then(response => response.json())
        .then(data => {
            // Populate dropdowns with airport data
            const airportOptions = data.map(airport => ({
                value: airport.IATA, // Use IATA code as the value
                label: `${airport.Name} (${airport.IATA})`,
            }));

            // Merge preset options with fetched options
            const finalOptionsOrigin = [...presetOptionsOrigin, ...airportOptions];
            const finalOptionsDestination = [...presetOptionsDestination, ...airportOptions];

            // Set options dynamically in Choices.js
            originChoices.setChoices(finalOptionsOrigin, 'value', 'label', true);
            destinationChoices.setChoices(finalOptionsDestination, 'value', 'label', true);
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
