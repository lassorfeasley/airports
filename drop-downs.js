document.addEventListener('DOMContentLoaded', async function () {
    const airportSearchInput = document.getElementById('airport-search');
    let airportData = [];

    // Initialize Choices.js
    const airportChoices = new Choices(airportSearchInput, {
        searchEnabled: false, // Disable built-in search
        shouldSort: false,   // Preserve order of filtered results
        placeholderValue: 'Type to search for an airport...', // Placeholder
        itemSelectText: '',  // Remove "Press to select" text
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
    function filterAirports(input) {
        if (input.trim() === '') {
            airportChoices.clearChoices(); // Clear dropdown if no input
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
        airportChoices.setChoices(
            matches.map((airport) => ({
                value: airport.IATA,
                label: `${airport.Name} (${airport.IATA})`
            })),
            'value',
            'label',
            true
        );
    }

    // Event listener for typing in the input field
    airportSearchInput.addEventListener('input', (event) => {
        const input = event.target.value;
        filterAirports(input);
    });

    // Fetch airport data on page load
    await fetchAirportData();
});
