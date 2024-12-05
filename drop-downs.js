document.addEventListener('DOMContentLoaded', async function () {
    const originDropdown = document.getElementById('origin-dropdown');
    const destinationDropdown = document.getElementById('destination-dropdown');
    let airportData = [];

    // Fetch airport data
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Filter airport options based on user input
    function filterAirports(input, dropdown) {
        // Clear the dropdown list
        dropdown.innerHTML = '';

        if (input.trim() === '') return; // Do nothing if input is empty

        // Filter airports by name or IATA code and limit results to 4
        const matches = airportData
            .filter((airport) =>
                airport.Name.toLowerCase().includes(input.toLowerCase()) ||
                airport.IATA.toLowerCase().includes(input.toLowerCase())
            )
            .slice(0, 4); // Limit to the top 4 matches

        // Add filtered results to the dropdown
        matches.forEach((airport) => {
            const option = document.createElement('option');
            option.value = airport.IATA;
            option.textContent = `${airport.Name} (${airport.IATA})`;
            dropdown.appendChild(option);
        });
    }

    // Event listener for the origin dropdown
    originDropdown.addEventListener('input', (event) => {
        const input = event.target.value;
        filterAirports(input, originDropdown);
    });

    // Event listener for the destination dropdown
    destinationDropdown.addEventListener('input', (event) => {
        const input = event.target.value;
        filterAirports(input, destinationDropdown);
    });

    // Set z-index for dropdowns to prevent overlap issues
    const dropdowns = [originDropdown, destinationDropdown];
    dropdowns.forEach((dropdown) => {
        dropdown.style.position = 'relative';
        dropdown.style.zIndex = '10'; // Ensure it's above other elements
    });

    await fetchAirportData(); // Fetch the airport data on page load
});
