document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");

    // Function to attach dropdown to input field
    function attachDropdown(inputField) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('custom-dropdown');
        dropdownContainer.style.position = 'absolute';
        dropdownContainer.style.zIndex = '1000';
        dropdownContainer.style.backgroundColor = 'white';
        dropdownContainer.style.border = '1px solid #ccc';
        dropdownContainer.style.width = `${inputField.offsetWidth}px`;
        dropdownContainer.style.maxHeight = '150px';
        dropdownContainer.style.overflowY = 'auto';
        dropdownContainer.style.display = 'none'; // Ensure dropdown is hidden initially
        document.body.appendChild(dropdownContainer);

        // Event listener to show dropdown on input focus
        inputField.addEventListener('focus', function () {
            const rect = inputField.getBoundingClientRect();
            dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
            dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
            dropdownContainer.style.display = 'block'; // Show dropdown on focus
        });

        // Event listener to hide dropdown on blur
        inputField.addEventListener('blur', function () {
            setTimeout(() => {
                dropdownContainer.style.display = 'none'; // Hide dropdown after blur
            }, 200); // Slight delay to allow selection
        });

        // Populate dropdown logic here (e.g., with airports)
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
                filteredAirports.forEach(airport => {
                    const option = document.createElement('div');
                    option.classList.add('dropdown-option');
                    option.style.padding = '8px';
                    option.style.cursor = 'pointer';
                    option.style.borderBottom = '1px solid #ddd';
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
                noResult.classList.add('dropdown-option');
                noResult.style.padding = '8px';
                noResult.style.color = 'gray';
                noResult.textContent = 'No results found';
                dropdownContainer.appendChild(noResult);
            }
        }

        // Event listener to update dropdown on input
        inputField.addEventListener('input', function () {
            const airports = [
                { name: 'San Francisco International Airport', municipality: 'San Francisco', iata_code: 'SFO' },
                { name: 'Los Angeles International Airport', municipality: 'Los Angeles', iata_code: 'LAX' },
                { name: 'John F. Kennedy International Airport', municipality: 'New York', iata_code: 'JFK' },
                { name: 'O'Hare International Airport', municipality: 'Chicago', iata_code: 'ORD' }
            ]; // Replace with dynamic data as needed
            populateDropdown(inputField, dropdownContainer, airports);
        });
    }

    // Attach dropdowns to both input fields
    attachDropdown(originDropdown);
    attachDropdown(destinationDropdown);
});
