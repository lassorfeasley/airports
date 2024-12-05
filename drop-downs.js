document.addEventListener('DOMContentLoaded', async function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    let airportData = [];

    // Initialize Choices.js for dropdowns
    const originChoices = new Choices(originDropdown, {
        searchEnabled: false,
        shouldSort: false,
        itemSelectText: '',
        placeholderValue: 'Type to search for an airport...'
    });

    const destinationChoices = new Choices(destinationDropdown, {
        searchEnabled: false,
        shouldSort: false,
        itemSelectText: '',
        placeholderValue: 'Type to search for an airport...'
    });

    // Fetch airport data
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Filter and display airport matches
    function filterAirports(input, choicesInstance) {
        if (input.trim() === '') {
            choicesInstance.clearChoices(); // Clear dropdown if no input
            return;
        }

        // Filter airports and show top 4 matches
        const matches = airportData
            .filter((airport) =>
                airport.Name.toLowerCase().includes(input.toLowerCase()) ||
                airport.IATA.toLowerCase().includes(input.toLowerCase())
            )
            .slice(0, 4); // Limit to 4 matches

        // Update the dropdown with filtered results
        choicesInstance.setChoices(
            matches.map((airport) => ({
                value: airport.IATA,
                label: `${airport.Name} (${airport.IATA})`
            })),
            'value',
            'label',
            true
        );
    }

    // Event listeners for typing input
    originDropdown.addEventListener('input', (event) => {
        const input = event.target.value;
        filterAirports(input, originChoices);
    });

    destinationDropdown.addEventListener('input', (event) => {
        const input = event.target.value;
        filterAirports(input, destinationChoices);
    });

    // Fetch airport data on page load
    await fetchAirportData();
});
