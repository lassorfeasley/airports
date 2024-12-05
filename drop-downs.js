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
        renderChoiceLimit: -1, // Show matching results dynamically
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
        renderChoiceLimit: -1, // Show matching results dynamically
    });

    let airportData = []; // Store the airport data globally

    // Fetch the JSON file
    fetch('https://lassorfeasley.github.io/airports/airports.json')
        .then(response => response.json())
        .then(data => {
            airportData = data;

            // Dynamically load options based on user search input
            originDropdown.addEventListener('search', (event) => {
                const searchQuery = event.detail.value.toLowerCase();
                const filteredAirports = airportData.filter(airport =>
                    airport.Name.toLowerCase().includes(searchQuery) ||
                    airport.IATA.toLowerCase().includes(searchQuery)
                );

                // Dynamically update choices
                originChoices.clearChoices();
                originChoices.setChoices(
                    filteredAirports.map(airport => ({
                        value: airport.IATA,
                        label: `${airport.Name} (${airport.IATA})`,
                    })),
                    'value',
                    'label',
                    true
                );
            });

            destinationDropdown.addEventListener('search', (event) => {
                const searchQuery = event.detail.value.toLowerCase();
                const filteredAirports = airportData.filter(airport =>
                    airport.Name.toLowerCase().includes(searchQuery) ||
                    airport.IATA.toLowerCase().includes(searchQuery)
                );

                // Dynamically update choices
                destinationChoices.clearChoices();
                destinationChoices.setChoices(
                    filteredAirports.map(airport => ({
                        value: airport.IATA,
                        label: `${airport.Name} (${airport.IATA})`,
                    })),
                    'value',
                    'label',
                    true
                );
            });
        })
        .catch(error => console.error('Error fetching airports data:', error));
});
