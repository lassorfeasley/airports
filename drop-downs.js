// This script uses choices.js and fetches airport data to enable the dropdown functionality.
// It allows the user to search for airports by typing into an input field, and displays the top 4 results.

// Webflow field IDs
const originFieldId = 'origin-dropdown';
const destinationFieldId = 'destination-dropdown';

// Choices.js initialization for the dropdowns
const originDropdown = new Choices(`#${originFieldId}`, {
  searchEnabled: true,
  shouldSort: false,
  placeholder: true,
  placeholderValue: 'Enter airport name',
  searchResultLimit: 4,
  searchChoices: true,
  removeItemButton: false, // Ensure only one selection is allowed
  maxItemCount: 1 // Limit to one selection
});

const destinationDropdown = new Choices(`#${destinationFieldId}`, {
  searchEnabled: true,
  shouldSort: false,
  placeholder: true,
  placeholderValue: 'Enter airport name',
  searchResultLimit: 4,
  searchChoices: true,
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
function attachSearchEvent(choicesInstance, airportData) {
  const searchInput = choicesInstance.input.element;
  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    console.log('Search term:', searchTerm); // Debugging log

    if (searchTerm.length > 0) {
      // Filter the top 4 results based on name, municipality, or iata_code
      const filteredAirports = airportData.filter(airport =>
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.municipality.toLowerCase().includes(searchTerm) ||
        airport.iata_code.toLowerCase().includes(searchTerm)
      ).slice(0, 4);

      console.log('Filtered Airports:', filteredAirports); // Debugging log

      if (filteredAirports.length > 0) {
        choicesInstance.clearStore(); // Properly clear choices and reset internal state
        filteredAirports.forEach(airport => {
          choicesInstance.setChoices([{
            value: `${airport.name} (${airport.iata_code})`,
            label: `${airport.name} (${airport.iata_code}) - ${airport.municipality}`
          }], 'value', 'label', false);
        });
      } else {
        choicesInstance.clearChoices();
      }
    } else {
      choicesInstance.clearChoices();
    }
  });
}

// Main function to initialize the dropdowns with fetched data
(async function () {
  const airportData = await fetchAirports();
  console.log('Airport data loaded:', airportData); // Debugging log

  attachSearchEvent(originDropdown, airportData);
  attachSearchEvent(destinationDropdown, airportData);
})();
