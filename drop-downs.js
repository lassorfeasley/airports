// Wait for the document to load
document.addEventListener('DOMContentLoaded', async function () {
    const originInput = document.getElementById('origin-dropdown');
    const destinationInput = document.getElementById('destination-dropdown');
    const originResults = document.getElementById('origin-results');
    const destinationResults = document.getElementById('destination-results');

    let airportData = [];

    // Fetch the CSV file and parse it
    async function fetchAirportData() {
        try {
            const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
            const csvText = await response.text();
            const rows = csvText.split('\n').slice(1); // Skip header row
            airportData = rows.map(row => {
                const columns = row.split(',');
                return {
                    Name: columns[3]?.replace(/"/g, ''), // Airport name
                    City: columns[10]?.replace(/"/g, ''), // City
                    IATA: columns[13]?.replace(/"/g, ''), // IATA code
                    Latitude: parseFloat(columns[4]), // Latitude
                    Longitude: parseFloat(columns[5]) // Longitude
                };
            }).filter(airport => airport.IATA); // Only include airports with IATA codes
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Filter and display results in the dropdown
    function filterAirports(inputValue, resultsElement) {
        const filteredAirports = airportData.filter(airport =>
            airport.Name.toLowerCase().includes(inputValue.toLowerCase()) ||
            airport.City.toLowerCase().includes(inputValue.toLowerCase()) ||
            airport.IATA.toLowerCase().includes(inputValue.toLowerCase())
        ).slice(0, 10); // Limit to 10 results

        // Clear previous results
        resultsElement.innerHTML = '';

        // Populate the dropdown with filtered results
        filteredAirports.forEach(airport => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = `${airport.Name} (${airport.IATA}) - ${airport.City}`;
            option.dataset.iata = airport.IATA;
            option.addEventListener('click', function () {
                resultsElement.previousElementSibling.value = `${airport.Name} (${airport.IATA})`;
                resultsElement.previousElementSibling.dataset.iata = airport.IATA;
                resultsElement.innerHTML = ''; // Clear results
            });
            resultsElement.appendChild(option);
        });

        // Show the dropdown only if there are results
        resultsElement.style.display = filteredAirports.length > 0 ? 'block' : 'none';
    }

    // Event listeners for origin and destination inputs
    originInput.addEventListener('input', () => filterAirports(originInput.value, originResults));
    destinationInput.addEventListener('input', () => filterAirports(destinationInput.value, destinationResults));

    // Hide dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (!originInput.contains(event.target) && !originResults.contains(event.target)) {
            originResults.style.display = 'none';
        }
        if (!destinationInput.contains(event.target) && !destinationResults.contains(event.target)) {
            destinationResults.style.display = 'none';
        }
    });

    // Fetch airport data
    await fetchAirportData();
});
