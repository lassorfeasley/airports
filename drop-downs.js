document.addEventListener('DOMContentLoaded', function () {
  // Select the text fields for origin and destination
  const originTextField = document.getElementById('origin-dropdown');
  const destinationTextField = document.getElementById('destination-dropdown');

  // Get the wrapper elements (parents of the fields)
  const originWrapper = originTextField.closest('.text-field-wrapper');
  const destinationWrapper = destinationTextField.closest('.text-field-wrapper');

  // Create dynamic dropdown containers for suggestions
  const originDropdownContainer = document.createElement('div');
  const destinationDropdownContainer = document.createElement('div');

  // Add classes for styling
  originDropdownContainer.className = 'dropdown-suggestions';
  destinationDropdownContainer.className = 'dropdown-suggestions';

  // Insert dropdown containers into the DOM
  originWrapper.appendChild(originDropdownContainer);
  destinationWrapper.appendChild(destinationDropdownContainer);

  let airportData = [];

  // Fetch airport data from the JSON file
  async function fetchAirportData() {
    try {
      const response = await fetch('https://lassorfeasley.github.io/airports/airports.json');
      airportData = await response.json();
    } catch (error) {
      console.error('Error fetching airports data:', error);
    }
  }

  // Filter airports based on user input, excluding Latitude and Longitude from search
  function filterAirports(query) {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();

    return airportData.filter((airport) => {
      const iata = (airport.IATA || '').toLowerCase();
      const name = (airport.Name || '').toLowerCase();
      const city = (airport.City || '').toLowerCase();
      const country = (airport.Country || '').toLowerCase();

      // Search by IATA, Name, City, and Country only
      return (
        iata.includes(lowerCaseQuery) ||
        name.includes(lowerCaseQuery) ||
        city.includes(lowerCaseQuery) ||
        country.includes(lowerCaseQuery)
      );
    });
  }

  // Populate dropdown suggestions
  function populateDropdown(container, airports, textField) {
    container.innerHTML = ''; // Clear existing suggestions

    airports.forEach((airport) => {
      const suggestion = document.createElement('div');
      suggestion.className = 'dropdown-suggestion';
      // Display the airport info. Adjust as needed.
      // For example, including City and Country:
      suggestion.textContent = `${airport.Name} (${airport.IATA}) - ${airport.City}, ${airport.Country}`;
      suggestion.dataset.iata = airport.IATA;

      // Add click event to select the suggestion
      suggestion.addEventListener('click', () => {
        textField.value = airport.IATA;
        container.innerHTML = '';
        container.classList.remove('active');
        textField.dispatchEvent(new Event('change'));
      });

      container.appendChild(suggestion);
    });

    // Toggle 'active' class depending on whether we have suggestions
    if (airports.length > 0) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }
  }

  // Event listener for origin input
  originTextField.addEventListener('input', () => {
    const filteredAirports = filterAirports(originTextField.value);
    const limitedAirports = filteredAirports.slice(0, 4); // Limit to 4 matches
    populateDropdown(originDropdownContainer, limitedAirports, originTextField);
  });

  // Event listener for destination input
  destinationTextField.addEventListener('input', () => {
    const filteredAirports = filterAirports(destinationTextField.value);
    const limitedAirports = filteredAirports.slice(0, 4); // Limit to 4 matches
    populateDropdown(destinationDropdownContainer, limitedAirports, destinationTextField);
  });

  // Hide dropdown suggestions when clicking outside
  document.addEventListener('click', (event) => {
    if (!originWrapper.contains(event.target)) {
      originDropdownContainer.innerHTML = '';
      originDropdownContainer.classList.remove('active');
    }

    if (!destinationWrapper.contains(event.target)) {
      destinationDropdownContainer.innerHTML = '';
      destinationDropdownContainer.classList.remove('active');
    }
  });

  // Fetch airport data on page load
  fetchAirportData();
});
