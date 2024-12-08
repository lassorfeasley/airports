document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");

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
                    iata_code: fields[13].replace(/"/g, "")
                });
            }
        }
        return airports;
    }

    // Function to attach dropdown to input field
    function attachDropdown(inputField, airports) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('custom-dropdown');
        document.body.appendChild(dropdownContainer);

        let currentIndex = -1; // Track the currently selected option

        function populateDropdown(inputField, dropdownContainer, airports) {
            dropdownContainer.innerHTML = ''; // Clear existing options
            currentIndex = -1; // Reset index when dropdown is rebuilt
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
                    option.classList.add('dropdown-option');
                    if (index === 0) {
                        option.classList.add('selected'); // Add selected class to the first option
                        currentIndex = 0; // Set the current index to the first option
                    }
                    option.textContent = `${airport.name} (${airport.iata_code})`;

                    option.addEventListener('click', function () {
                        inputField.value = `${airport.name}`;
                        inputField.dataset.iataCode = airport.iata_code;
                        dropdownContainer.style.display = 'none';
                    });

                    dropdownContainer.appendChild(option);
                });
            } else {
                const noResult = document.createElement('div');
                noResult.classList.add('dropdown-option', 'no-result');
                noResult.textContent = 'No results found';
                dropdownContainer.appendChild(noResult);
                currentIndex = -1; // Reset current index if no results
            }
        }

        // Event listener to update dropdown on input
        inputField.addEventListener('input', function () {
            if (inputField.value.trim().length > 0) {
                const rect = inputField.getBoundingClientRect();
                dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
                dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
                dropdownContainer.style.width = `${inputField.offsetWidth}px`;
                dropdownContainer.style.display = 'block'; // Show dropdown
                populateDropdown(inputField, dropdownContainer, airports);
            } else {
                dropdownContainer.style.display = 'none'; // Hide dropdown if input is empty
            }
        });

        // Hide dropdown on blur
        inputField.addEventListener('blur', function () {
            setTimeout(() => {
                dropdownContainer.style.display = 'none';
            }, 200); // Slight delay to allow selection
        });

        // Event listener for keyboard navigation
        inputField.addEventListener('keydown', function (event) {
            const options = dropdownContainer.querySelectorAll('.dropdown-option');
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (currentIndex < options.length - 1) {
                    if (currentIndex >= 0) {
                        options[currentIndex].classList.remove('selected');
                    }
                    currentIndex++;
                    options[currentIndex].classList.add('selected');
                    options[currentIndex].scrollIntoView({ block: "nearest" }); // Ensure visibility
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (currentIndex > 0) {
                    options[currentIndex].classList.remove('selected');
                    currentIndex--;
                    options[currentIndex].classList.add('selected');
                    options[currentIndex].scrollIntoView({ block: "nearest" }); // Ensure visibility
                }
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (currentIndex >= 0 && options[currentIndex]) {
                    options[currentIndex].click();
                }
            }
        });
    }

    const airportData = await fetchAirportData();
    attachDropdown(originDropdown, airportData);
    attachDropdown(destinationDropdown, airportData);
});
