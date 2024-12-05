document.addEventListener('DOMContentLoaded', function () {
  // Select the text fields for origin and destination
  const originTextField = document.getElementById('origin-dropdown');
  const destinationTextField = document.getElementById('destination-dropdown');

  // Create dynamic dropdown containers for suggestions
  const originDropdownContainer = document.createElement('div');
  const destinationDropdownContainer = document.createElement('div');

  // Add classes for styling
  originDropdownContainer.className = 'dropdown-suggestions';
  destinationDropdownContainer.className = 'dropdown-suggestions';

  // Insert dropdown containers into the DOM below the text fields
  originTextField.parentNode.insertBefore(originDropdownContainer, originTextField.nextSibling);
  destinationTextField.parentNode.insertBefore(destinationDropdownContainer, destinationTextField.nextSibling);

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

  // Filter airports based on user input
  function filterAirports(query) {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return airportData.filter(
      (airport) =>
        airport.IATA.toLowerCase().includes(lowerCaseQuery) ||
        airport.Name.toLowerCase().includes(lowerCaseQuery) ||
        airport.City.toLowerCase().includes(lowerCaseQuery)
    );
  }

  // Populate dropdown suggestions
  function populateDropdown(container, airports, textField) {
    container.innerHTML = ''; // Clear existing suggestions

    airports.forEach((airport) => {
      const suggestion = document.createElement('div');
      suggestion.className = 'dropdown-suggestion';
      suggestion.textContent = `${airport.Name} (${airport.IATA}) - ${airport.City}`;
      suggestion.dataset.iata = airport.IATA;

      // Add click event to select the suggestion
      suggestion.addEventListener('click', () => {
        textField.value = airport.IATA;
        container.innerHTML = ''; // Clear suggestions
        textField.dispatchEvent(new Event('change')); // Trigger a change event for external listeners
      });

      container.appendChild(suggestion);
    });
  }

  // Add input event listeners to text fields
  originTextField.addEventListener('input', () => {
    const filteredAirports = filterAirports(originTextField.value);
    populateDropdown(originDropdownContainer, filteredAirports, originTextField);
  });

  destinationTextField.addEventListener('input', () => {
    const filteredAirports = filterAirports(destinationTextField.value);
    populateDropdown(destinationDropdownContainer, filteredAirports, destinationTextField);
  });

  // Hide dropdown suggestions when clicking outside the input
  document.addEventListener('click', (event) => {
    if (!originTextField.contains(event.target) && !originDropdownContainer.contains(event.target)) {
      originDropdownContainer.innerHTML = '';
    }

    if (!destinationTextField.contains(event.target) && !destinationDropdownContainer.contains(event.target)) {
      destinationDropdownContainer.innerHTML = '';
    }
  });

  // Fetch airport data on page load
  fetchAirportData();
});
