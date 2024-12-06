// This script uses choices.js and fetches airport data to enable the dropdown functionality.
// It allows the user to search for airports by typing into an input field, and displays the top 4 results.

// Webflow field IDs
const originFieldId = 'origin-dropdown';
const destinationFieldId = 'destination-dropdown';

// Choices.js initialization for the dropdowns
const originDropdown = new Choices(`#${originFieldId}`, {
  searchEnabled: false,
  shouldSort: false,
  placeholder: true,
  placeholderValue: 'Enter airport name',
  removeItemButton: false, // Ensure only one selection is allowed
  maxItemCount: 1 // Limit to one selection
});

const destinationDropdown = new Choices(`#${destinationFieldId}`, {
  searchEnabled: false,
  shouldSort: false,
  placeholder: true,
  placeholderValue: 'Enter airport name',
  removeItemButton: false, // Ensure only one selection is allowed
  maxItemCount: 1 // Limit to one selection
});

// Fetching airport data from the CSV file
async function fetchAirports() {
  const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
  const data = await response.text();
  return parseCSV(data);
}

// Function to parse CSV into a usable array of objects
function parseCSV(data) {
  const lines = data.split('\n');
  const headers = lines[0].split(',');
  const airportList = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields[2] === '"large_airport"' && fields[13]) { // Only use large airports with valid IATA codes
      airportList.push({
        name: fields[3].replace(/"/g, ''),
        municipality: fields[10].replace(/"/g, ''),
        iata_code: fields[13].replace(/"/g, ''),
      });
    }
  }
  return airportList;
}

// Attach event listeners to origin and destination dropdowns
function attachSearchEvent(inputFieldId, airportData) {
  const inputElement = document.getElementById(inputFieldId);
  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('custom-dropdown');
  dropdownContainer.style.position = 'absolute';
  dropdownContainer.style.zIndex = '1000';
  dropdownContainer.style.backgroundColor = 'white';
  dropdownContainer.style.border = '1px solid #ccc';
  dropdownContainer.style.width = `${inputElement.offsetWidth}px`;
  dropdownContainer.style.display = 'none';
  dropdownContainer.style.maxHeight = '150px';
  dropdownContainer.style.overflowY = 'auto'; // Add scroll if there are many options
  inputElement.parentNode.appendChild(dropdownContainer);

  inputElement.addEventListener('input', function () {
    const searchTerm = inputElement.value.toLowerCase();
    dropdownContainer.innerHTML = '';
    console.log('User input:', searchTerm); // Debugging log

    if (searchTerm.length > 0) {
      // Filter the top 4 results based on name, municipality, or iata_code
      const filteredAirports = airportData.filter(airport =>
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.municipality.toLowerCase().includes(searchTerm) ||
        airport.iata_code.toLowerCase().includes(searchTerm)
      ).slice(0, 4);

      console.log('Filtered Airports:', filteredAirports); // Debugging log

      if (filteredAirports.length > 0) {
        filteredAirports.forEach(airport => {
          const option = document.createElement('div');
          option.classList.add('dropdown-option');
          option.style.padding = '8px';
          option.style.cursor = 'pointer';
          option.style.borderBottom = '1px solid #ddd';
          option.textContent = `${airport.name} (${airport.iata_code}) - ${airport.municipality}`;
          option.addEventListener('click', function () {
            inputElement.value = `${airport.name} (${airport.iata_code})`;
            dropdownContainer.style.display = 'none';
          });
          dropdownContainer.appendChild(option);
        });
        dropdownContainer.style.display = 'block';
        dropdownContainer.style.top = `${inputElement.offsetTop + inputElement.offsetHeight}px`;
        dropdownContainer.style.left = `${inputElement.offsetLeft}px`;
      } else {
        dropdownContainer.style.display = 'none';
      }
    } else {
      dropdownContainer.style.display = 'none';
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (!dropdownContainer.contains(event.target) && event.target !== inputElement) {
      dropdownContainer.style.display = 'none';
    }
  });
}

// Main function to initialize the dropdowns with fetched data
(async function () {
  const airportData = await fetchAirports();
  console.log('Airport data loaded:', airportData); // Debugging log

  attachSearchEvent(originFieldId, airportData);
  attachSearchEvent(destinationFieldId, airportData);
})();
