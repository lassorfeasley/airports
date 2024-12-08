document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");
    const originCoordinates = document.getElementById("Origin-coordinates");
    const destinationCoordinates = document.getElementById("Destination-coordinates");

    // Fetch and parse airport data
    async function fetchAirportData() {
        try {
            const response = await fetch("https://davidmegginson.github.io/ourairports-data/airports.csv");
            const data = await response.text();
            return parseCSV(data);
        } catch (error) {
            console.error("Error fetching airport data:", error);
            return [];
        }
    }

    function parseCSV(data) {
        const lines = data.split("\n");
        const airports = [];
        for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split(",");
            if (fields[2] === '"large_airport"' && fields[13]) {
                airports.push({
                    name: fields[3].replace(/"/g, ""),
                    municipality: fields[10].replace(/"/g, ""),
                    iata_code: fields[13].replace(/"/g, ""),
                    latitude: parseFloat(fields[4]),
                    longitude: parseFloat(fields[5])
                });
            }
        }
        return airports;
    }

    // Function to attach dropdown to input field
    function attachDropdown(inputField, airports, coordinatesField) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'absolute';
        dropdownContainer.style.zIndex = '1000';
        dropdownContainer.style.backgroundColor = 'white';
        dropdownContainer.style.border = '1px solid #ccc';
        dropdownContainer.style.maxHeight = '150px';
        dropdownContainer.style.overflowY = 'auto';
        dropdownContainer.style.display = 'none'; // Hidden by default
        document.body.appendChild(dropdownContainer);

        function populateDropdown(inputField, dropdownContainer, airports) {
            dropdownContainer.innerHTML = ''; // Clear existing options
            const searchTerm = inputField.value.toLowerCase();

            // Filter airports based on input
            const filteredAirports = airports.filter(airport =>
                airport.name.toLowerCase().includes(searchTerm) ||
                airport.municipality.toLowerCase().includes(searchTerm) ||
                airport.iata_code.toLowerCase().includes(searchTerm)
            ).slice(0, 4); // Limit to top 4 results

            if (filteredAirports.length > 0) {
                filteredAirports.forEach((airport, index) => {
                    const option = document.createElement('div');
                    option.style.padding = '8px';
                    option.style.cursor = 'pointer';
                    option.style.borderBottom = '1px solid #ddd';
                    option.textContent = `${airport.name} (${airport.iata_code})`;

                    if (index === 0) {
                        option.style.backgroundColor = '#f0f0f0';
                    }

                    option.addEventListener('mouseover', function () {
                        option.style.backgroundColor = '#e0e0e0';
                    });

                    option.addEventListener('mouseout', function () {
                        option.style.backgroundColor = index === 0 ? '#f0f0f0' : 'white';
                    });

                    option.addEventListener('click', function () {
                        inputField.value = `${airport.name}`;
                        inputField.dataset.iataCode = airport.iata_code;
                        coordinatesField.value = `${airport.latitude}, ${airport.longitude}`;
                        console.log(`Selected coordinates: ${airport.latitude}, ${airport.longitude}`);
                        dropdownContainer.style.display = 'none';
                    });

                    dropdownContainer.appendChild(option);
                });
                dropdownContainer.style.display = 'block'; // Show dropdown
            } else {
                const noResult = document.createElement('div');
                noResult.style.padding = '8px';
                noResult.style.color = 'gray';
                noResult.textContent = 'No results found';
                dropdownContainer.appendChild(noResult);
                dropdownContainer.style.display = 'block';
            }
        }

        // Event listener to update dropdown on input
        inputField.addEventListener('input', function () {
            if (inputField.value.trim().length > 0) {
                const rect = inputField.getBoundingClientRect();
                dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
                dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
                dropdownContainer.style.width = `${inputField.offsetWidth}px`;
                populateDropdown(inputField, dropdownContainer, airports);
            } else {
                dropdownContainer.style.display = 'none'; // Hide dropdown if input is empty
            }
        });

        // Hide dropdown on blur and select the closest match
        inputField.addEventListener('blur', function () {
            setTimeout(() => {
                const firstOption = dropdownContainer.querySelector('.dropdown-option');
                if (firstOption && inputField.value.trim().length > 0) {
                    firstOption.click();
                }
                dropdownContainer.style.display = 'none';
            }, 200); // Slight delay to allow selection
        });

        // Event listener for Enter key to select top result
        inputField.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const firstOption = dropdownContainer.querySelector('.dropdown-option');
                if (firstOption) {
                    firstOption.click();
                    event.preventDefault(); // Prevent form submission or default behavior
                }
            }
        });
    }

    const airportData = await fetchAirportData();
    attachDropdown(originDropdown, airportData, originCoordinates);
    attachDropdown(destinationDropdown, airportData, destinationCoordinates);
});
