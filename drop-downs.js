<script>
// Wait for the document to load
document.addEventListener("DOMContentLoaded", async function() {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");
    let airportData = []; // Store airport data locally

    // Default popular airports
    const popularAirports = [
        { IATA: "SFO", Name: "San Francisco International Airport (SFO)" },
        { IATA: "JFK", Name: "John F. Kennedy International Airport (JFK)" },
        { IATA: "LGA", Name: "LaGuardia Airport (LGA)" },
    ];

    // Fetch airport data once on page load
    async function fetchAirportData() {
        try {
            const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
            airportData = await response.json();
        } catch (error) {
            console.error('Error fetching airport data:', error);
        }
    }

    // Populate the dropdown with initial popular airports
    function populateDropdownWithPopular(dropdown) {
        dropdown.innerHTML = ""; // Clear existing options
        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "Type to search for an airport...";
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        dropdown.appendChild(placeholderOption);

        popularAirports.forEach((airport) => {
            const option = document.createElement("option");
            option.value = airport.IATA;
            option.textContent = airport.Name;
            dropdown.appendChild(option);
        });
    }

    // Initialize Choices.js
    function initializeChoices(dropdown) {
        return new Choices(dropdown, {
            placeholderValue: "Type to search for an airport...",
            searchPlaceholderValue: "Search airports...",
            shouldSort: false,
            fuseOptions: {
                keys: ["label", "value"],
                threshold: 0.3,
            },
        });
    }

    // Update Choices.js options dynamically
    function updateChoices(choicesInstance, searchQuery) {
        const filteredAirports = airportData.filter((airport) =>
            airport.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            airport.IATA.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const options = filteredAirports.map((airport) => ({
            value: airport.IATA,
            label: `${airport.Name} (${airport.IATA})`,
        }));

        if (options.length === 0) {
            options.push({ value: "", label: "No results found", disabled: true });
        }

        choicesInstance.clearChoices();
        choicesInstance.setChoices(options, "value", "label", true);
    }

    // Fetch data and initialize dropdowns
    await fetchAirportData();
    populateDropdownWithPopular(originDropdown);
    populateDropdownWithPopular(destinationDropdown);

    const originChoices = initializeChoices(originDropdown);
    const destinationChoices = initializeChoices(destinationDropdown);

    // Add input event to dynamically update the dropdowns
    originDropdown.addEventListener("search", (event) => {
        const searchQuery = event.detail.value;
        if (searchQuery.trim()) {
            updateChoices(originChoices, searchQuery);
        } else {
            populateDropdownWithPopular(originDropdown);
        }
    });

    destinationDropdown.addEventListener("search", (event) => {
        const searchQuery = event.detail.value;
        if (searchQuery.trim()) {
            updateChoices(destinationChoices, searchQuery);
        } else {
            populateDropdownWithPopular(destinationDropdown);
        }
    });
});
</script>
