document.addEventListener('DOMContentLoaded', async function () {
    const originInput = document.getElementById('origin-dropdown');
    const destinationInput = document.getElementById('destination-dropdown');
    const originDropdown = document.createElement('div');
    const destinationDropdown = document.createElement('div');
    
    // Styles for dropdown
    originDropdown.style.position = "absolute";
    originDropdown.style.zIndex = "10";
    originDropdown.style.background = "#fff";
    originDropdown.style.border = "1px solid #ccc";
    originDropdown.style.borderRadius = "10px";
    originDropdown.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    originDropdown.style.width = "100%";
    originDropdown.style.maxHeight = "200px";
    originDropdown.style.overflowY = "auto";
    originDropdown.style.display = "none";
    
    destinationDropdown.style.position = "absolute";
    destinationDropdown.style.zIndex = "10";
    destinationDropdown.style.background = "#fff";
    destinationDropdown.style.border = "1px solid #ccc";
    destinationDropdown.style.borderRadius = "10px";
    destinationDropdown.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    destinationDropdown.style.width = "100%";
    destinationDropdown.style.maxHeight = "200px";
    destinationDropdown.style.overflowY = "auto";
    destinationDropdown.style.display = "none";

    // Insert the dropdowns right after the inputs
    originInput.parentNode.insertBefore(originDropdown, originInput.nextSibling);
    destinationInput.parentNode.insertBefore(destinationDropdown, destinationInput.nextSibling);

    let airportData = [];

    // Fetch and parse CSV
    async function fetchAirportData() {
        try {
            const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
            const text = await response.text();
            const rows = text.split('\n').slice(1); // Skip header row
            airportData = rows.map(row => {
                const columns = row.split(',');
                return {
                    AirportName: columns[3]?.replace(/"/g, '').trim(), // Name
                    City: columns[10]?.replace(/"/g, '').trim(), // Municipality
                    IATA: columns[13]?.replace(/"/g, '').trim(), // IATA Code
                    Latitude: parseFloat(columns[4]), // Latitude
                    Longitude: parseFloat(columns[5]) // Longitude
                };
            }).filter(airport => airport.IATA && airport.City); // Only include valid entries
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Filter and display airports
    function filterAirports(input, dropdown, query) {
        dropdown.innerHTML = '';
        const filteredAirports = airportData.filter(airport => 
            airport.AirportName.toLowerCase().includes(query.toLowerCase()) ||
            airport.City.toLowerCase().includes(query.toLowerCase()) ||
            airport.IATA.toLowerCase().includes(query.toLowerCase())
        );
        filteredAirports.forEach(airport => {
            const option = document.createElement('div');
            option.textContent = `${airport.AirportName} (${airport.IATA}) - ${airport.City}`;
            option.style.padding = "8px";
            option.style.cursor = "pointer";
            option.style.borderBottom = "1px solid #eee";

            option.addEventListener('click', () => {
                input.value = `${airport.AirportName} (${airport.IATA})`;
                dropdown.style.display = 'none';
            });

            dropdown.appendChild(option);
        });
        dropdown.style.display = filteredAirports.length ? 'block' : 'none';
    }

    // Attach event listeners
    originInput.addEventListener('input', () => {
        filterAirports(originInput, originDropdown, originInput.value);
    });
    destinationInput.addEventListener('input', () => {
        filterAirports(destinationInput, destinationDropdown, destinationInput.value);
    });

    originInput.addEventListener('blur', () => {
        setTimeout(() => originDropdown.style.display = 'none', 200); // Delay to allow click
    });
    destinationInput.addEventListener('blur', () => {
        setTimeout(() => destinationDropdown.style.display = 'none', 200);
    });

    await fetchAirportData();
});
