document.addEventListener('DOMContentLoaded', function () {
  // Select the text fields for origin and destination
  const originTextField = document.getElementById('origin-dropdown');
  const destinationTextField = document.getElementById('destination-dropdown');

  // Ensure these fields are wrapped in an element with class "text-field-wrapper"
  // Example HTML structure:
  // <div class="text-field-wrapper">
  //   <input type="text" id="origin-dropdown" class="text-field" placeholder="Search origin...">
  // </div>
  // <div class="text-field-wrapper">
  //   <input type="text" id="destination-dropdown" class="text-field" placeholder="Search destination...">
  // </div>

  // Get the wrapper elements (parents of the fields)
  const originWrapper = originTextField.closest('.text-field-wrapper');
  const destinationWrapper = destinationTextField.closest('.text-field-wrapper');

  // Create dynamic dropdown containers for suggestions
  const originDropdownContainer = document.createElement('div');
  const destinationDropdownContainer = document.createElement('div');

  // Add classes for styling
  originDropdownContainer.className = 'dropdown-suggestions';
  destinationDropdownContainer.className = 'dropdown-suggestions';

  // Insert dropdown containers into the DOM below each text field
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

  // Filter airports based on user input
  function filterAirports(query) {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();

    return airportData.filter((airport) => {
      const iata = airport.IATA || '';
      const name = airport.Name || '';
      const city = airport.City || '';

      return (
        iata.toLowerCase().includes(lowerCaseQuery) ||
        name.toLowerCase().includes(lowerCaseQuery) ||
        city.toLowerCase().includes(lowerCaseQuery)
      );
    });
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
        container.classList.remove('active'); // Hide the dropdown
        textField.dispatchEvent(new Event('change')); // Trigger a change event
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

  // Add input event listeners to text fields
  originTextField.addEventListener('input', () => {
    const filteredAirports = filterAirports(originTextField.value);
    const limitedAirports = filteredAirports.slice(0, 4); // Limit to 4 matches
    populateDropdown(originDropdownContainer, limitedAirports, originTextField);
  });

  destinationTextField.addEventListener('input', () => {
    const filteredAirports = filterAirports(destinationTextField.value);
    const limitedAirports = filteredAirports.slice(0, 4); // Limit to 4 matches
    populateDropdown(destinationDropdownContainer, limitedAirports, destinationTextField);
  });

  // Hide dropdown suggestions when clicking outside the input fields or dropdown
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
