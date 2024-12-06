// This script fetches airport data to enable the dropdown functionality.
// It allows the user to search for airports by typing into an input field, and displays the top 4 results.

// Webflow field IDs
const originFieldId = 'origin-dropdown';
const destinationFieldId = 'destination-dropdown';
let airportData = []; // Store airport data globally

// Default popular airports
const popularAirports = [
  { iata_code: 'SFO', name: 'San Francisco International Airport', municipality: 'San Francisco' },
  { iata_code: 'JFK', name: 'John F. Kennedy International Airport', municipality: 'New York' },
  { iata_code: 'LGA', name: 'LaGuardia Airport', municipality: 'New York' },
  { iata_code: 'LAX', name: 'Los Angeles International Airport', municipality: 'Los Angeles' }
];

// Fetching airport data from the CSV file
async function fetchAirports() {
  try {
    const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
    const data = await response.text();
    return parseCSV(data);
  } catch (error) {
    console.error('Error fetching airport data:', error);
    return []; // Return an empty array on error
  }
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
      latitude_deg: parseFloat(fields[4]),
      longitude_deg: parseFloat(fields[5]),
    });
    }
  }
  return airportList;
}

// Populate dropdown with popular airports
function populateDropdownWithPopular(dropdownContainer) {
    dropdownContainer.innerHTML = ''; // Clear existing options

    popularAirports.forEach((airport) => {
        const option = document.createElement('div');
        option.classList.add('dropdown-option');
        option.style.padding = '8px';
        option.style.cursor = 'pointer';
        option.style.borderBottom = '1px solid #ddd';
        option.textContent = `${airport.name} (${airport.iata_code})`;
        
        // Fix: Correct the reference to properly select the corresponding dropdown element
        option.addEventListener('click', function () {
            const inputElement = dropdownContainer.previousElementSibling; // Corrected reference to input element
            inputElement.dataset.iataCode = airport.iata_code;
            inputElement.dataset.latitude = airport.latitude_deg;
            inputElement.dataset.longitude = airport.longitude_deg;
            inputElement.value = `${airport.name}`; // Show only airport name after selection
            dropdownContainer.style.display = 'none';
        });
        dropdownContainer.appendChild(option);
    });
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
  document.body.appendChild(dropdownContainer);

  // Populate with popular airports initially
  populateDropdownWithPopular(dropdownContainer);
  dropdownContainer.style.display = 'block';
  const rect = inputElement.getBoundingClientRect();
  dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
  dropdownContainer.style.left = `${window.scrollX + rect.left}px`;

  inputElement.addEventListener('input', function () {
    const searchTerm = inputElement.value.toLowerCase().trim();
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
          option.textContent = `${airport.name} (${airport.iata_code})`;
          option.addEventListener('click', function () {
$1  inputElement.dataset.iataCode = airport.iata_code;
  inputElement.dataset.latitude = airport.latitude_deg;
  inputElement.dataset.longitude = airport.longitude_deg;
  dropdownContainer.style.display = 'none';
          });
          dropdownContainer.appendChild(option);
        });
        dropdownContainer.style.display = 'block';
        dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
        dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
      } else {
        dropdownContainer.style.display = 'none';
      }
    } else {
      // Show popular airports when input is cleared
      populateDropdownWithPopular(dropdownContainer);
      dropdownContainer.style.display = 'block';
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
document.addEventListener('DOMContentLoaded', async function () {
  airportData = await fetchAirports();
  console.log('Airport data loaded:', airportData); // Debugging log

  attachSearchEvent(originFieldId, airportData);
  attachSearchEvent(destinationFieldId, airportData);
});
