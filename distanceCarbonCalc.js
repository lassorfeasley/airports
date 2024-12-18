function attachDropdown(inputField, airports) {
    const dropdownContainer = document.createElement('div');
    dropdownContainer.style.position = 'absolute';
    dropdownContainer.style.zIndex = '1000';
    dropdownContainer.style.backgroundColor = 'white';
    dropdownContainer.style.border = '1px solid #ccc';
    dropdownContainer.style.maxHeight = '150px';
    dropdownContainer.style.overflowY = 'auto';
    dropdownContainer.style.display = 'none';
    dropdownContainer.style.borderRadius = '10px'; // Rounded corners
    dropdownContainer.style.marginTop = '5px';    // Margin between text field and dropdown
    dropdownContainer.style.overflow = 'hidden';  // Ensures corners are fully rounded
    document.body.appendChild(dropdownContainer);

    function populateDropdown(inputField, dropdownContainer, airports) {
        dropdownContainer.innerHTML = '';
        const searchTerm = inputField.value.toLowerCase();

        const filteredAirports = airports.filter(airport =>
            airport.name.toLowerCase().includes(searchTerm) ||
            airport.municipality.toLowerCase().includes(searchTerm) ||
            airport.iata_code.toLowerCase().includes(searchTerm)
        ).slice(0, 4);

        if (filteredAirports.length > 0) {
            filteredAirports.forEach((airport, index) => {
                const option = document.createElement('div');
                option.style.padding = '8px';
                option.style.cursor = 'pointer';
                option.style.borderBottom = '1px solid #ddd';
                option.textContent = `${airport.name} (${airport.iata_code})`;

                // Add "heading-five" class
                option.classList.add('heading-five');

                option.addEventListener('click', function () {
                    inputField.value = `${airport.name}`;
                    inputField.dataset.iataCode = airport.iata_code;
                    dropdownContainer.style.display = 'none';
                    handleSelectionChange();
                });

                dropdownContainer.appendChild(option);
            });
            dropdownContainer.style.display = 'block';
        } else {
            const noResult = document.createElement('div');
            noResult.style.padding = '8px';
            noResult.style.color = 'gray';
            noResult.textContent = 'No results found';
            noResult.classList.add('heading-five'); // Apply "heading-five" to no results too
            dropdownContainer.appendChild(noResult);
            dropdownContainer.style.display = 'block';
        }
    }

    inputField.addEventListener('input', function () {
        if (inputField.value.trim().length > 0) {
            const rect = inputField.getBoundingClientRect();
            dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
            dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
            dropdownContainer.style.width = `${inputField.offsetWidth}px`;
            populateDropdown(inputField, dropdownContainer, airports);
        } else {
            dropdownContainer.style.display = 'none';
        }
    });

    inputField.addEventListener('blur', function () {
        setTimeout(() => {
            dropdownContainer.style.display = 'none';
        }, 200);
    });

    inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const firstOption = dropdownContainer.querySelector('div');
            if (firstOption) {
                firstOption.click();
                event.preventDefault();
            }
        }
    });
}
