document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");
    let airportData = []; // Store airport data locally

    // Fetch airport data
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

    // Parse CSV data
    function parseCSV(data) {
        const lines = data.split("\n");
        const headers = lines[0].split(",");
        const airports = [];

        for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split(",");
            if (fields[2] === '"large_airport"' && fields[13]) {
                airports.push({
                    name: fields[3].replace(/"/g, ""),
                    municipality: fields[10].replace(/"/g, ""),
                    iata_code: fields[13].replace(/"/g, ""),
                });
            }
        }
        return airports;
    }

    // Attach dropdown to input field
    function attachDropdown(inputField, airports) {
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("custom-dropdown");
        dropdownContainer.style.position = "absolute";
        dropdownContainer.style.zIndex = "1000";
        dropdownContainer.style.backgroundColor = "white";
        dropdownContainer.style.border = "1px solid #ccc";
        dropdownContainer.style.width = `${inputField.offsetWidth}px`;
        dropdownContainer.style.maxHeight = "150px";
        dropdownContainer.style.overflowY = "auto";
        dropdownContainer.style.display = "none"; // Ensure dropdown is hidden initially
        document.body.appendChild(dropdownContainer);

        // Event listener to show dropdown on input focus
        inputField.addEventListener("focus", function () {
            const rect = inputField.getBoundingClientRect();
            dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
            dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
            dropdownContainer.style.display = "block"; // Show dropdown on focus
            populateDropdown(airports, dropdownContainer, inputField);
        });

        // Event listener to hide dropdown on blur
        inputField.addEventListener("blur", function () {
            setTimeout(() => {
                dropdownContainer.style.display = "none"; // Hide dropdown after blur
            }, 200); // Slight delay to allow selection
        });
    }

    // Populate the dropdown with filtered airports
    function populateDropdown(airports, dropdownContainer, inputField) {
        dropdownContainer.innerHTML = ""; // Clear previous options
        const searchTerm = inputField.value.toLowerCase();

        const filteredAirports = airports
            .filter(
                (airport) =>
                    airport.name.toLowerCase().includes(searchTerm) ||
                    airport.municipality.toLowerCase().includes(searchTerm) ||
                    airport.iata_code.toLowerCase().includes(searchTerm)
            )
            .slice(0, 4); // Limit to top 4 results

        if (filteredAirports.length > 0) {
            filteredAirports.forEach((airport) => {
                const option = document.createElement("div");
                option.classList.add("dropdown-option");
                option.style.padding = "8px";
                option.style.cursor = "pointer";
                option.style.borderBottom = "1px solid #ddd";
                option.textContent = `${airport.name} (${airport.iata_code})`;

                option.addEventListener("click", function () {
                    inputField.value = `${airport.name}`;
                    inputField.dataset.iataCode = airport.iata_code;
                    dropdownContainer.style.display = "none"; // Hide dropdown
                });

                dropdownContainer.appendChild(option);
            });
        } else {
            const noResult = document.createElement("div");
            noResult.classList.add("dropdown-option");
            noResult.style.padding = "8px";
            noResult.style.color = "gray";
            noResult.textContent = "No results found";
            dropdownContainer.appendChild(noResult);
        }
    }

    // Initialize the dropdowns
    airportData = await fetchAirportData();
    attachDropdown(originDropdown, airportData);
    attachDropdown(destinationDropdown, airportData);
});
