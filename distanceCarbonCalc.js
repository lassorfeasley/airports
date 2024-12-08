document.addEventListener("DOMContentLoaded", async function () {
    const mapboxAccessToken = "pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg";
    const mapStyle = "mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay";
    const map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        center: [0, 0],
        zoom: 2
    });

    let markers = [];
    let routeLine = null;

    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");
    const roundTripCheckbox = document.getElementById("roundtrip-checkbox");
    const flightClassRadios = document.querySelectorAll("input[name='class']");
    const originCoordinatesField = document.getElementById("Origin-coordinates");
    const destinationCoordinatesField = document.getElementById("Destination-coordinates");
    const totalMilesField = document.getElementById("Total-miles");
    const carbonCostField = document.getElementById("carbon-cost");
    const panelsToOffsetField = document.getElementById("panels-to-offset");

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

    function parseCSV(data) {
        const lines = data.split("\n");
        const airports = [];
        for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split(",");
            if (fields[2] === '"large_airport"' && fields[13]) {
                airports.push({
                    name: fields[3].replace(/"/g, ""),
                    municipality: fields[10].replace(/"/g, ""),
                    iata_code: fields[13].replace(/"/g, ""),
                    latitude: parseFloat(fields[4]),
                    longitude: parseFloat(fields[5])
                });
            }
        }
        return airports;
    }

    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const toRadians = degrees => degrees * (Math.PI / 180);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function calculateMetrics(origin, destination, isRoundTrip, flightClassMultiplier) {
        const distance = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
        const totalDistance = distance * (isRoundTrip ? 2 : 1);
        const carbonCost = totalDistance * flightClassMultiplier;
        const panelsNeeded = Math.ceil(carbonCost * 0.01); // Panels per kg CO2
        return { totalDistance, carbonCost, panelsNeeded };
    }

    function updateFields(metrics, origin, destination) {
        if (origin) {
            originCoordinatesField.textContent = `${origin.latitude}, ${origin.longitude}`;
        }
        if (destination) {
            destinationCoordinatesField.textContent = `${destination.latitude}, ${destination.longitude}`;
        }
        if (metrics) {
            totalMilesField.textContent = metrics.totalDistance.toFixed(2);
            carbonCostField.textContent = metrics.carbonCost.toFixed(2);
            panelsToOffsetField.textContent = metrics.panelsNeeded;
        }
    }

    function addMarker(lat, lng) {
        const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
        markers.push(marker);
        if (markers.length === 2) drawRoute(markers[0].getLngLat(), markers[1].getLngLat());
    }

    function drawRoute(start, end) {
        if (routeLine) {
            map.removeLayer("route");
            map.removeSource("route");
        }
        const route = {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[start.lng, start.lat], [end.lng, end.lat]] }
        };
        map.addSource("route", { type: "geojson", data: route });
        map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            paint: { "line-color": "#ff0000", "line-width": 4 }
        });
    }

    const airportData = await fetchAirportData();

    function handleSelectionChange() {
        const originIATA = originDropdown.dataset.iataCode;
        const destinationIATA = destinationDropdown.dataset.iataCode;
        const isRoundTrip = roundTripCheckbox.checked;
        const flightClassMultiplier = parseFloat([...flightClassRadios].find(radio => radio.checked)?.value || 0.15);
        const origin = airportData.find(airport => airport.iata_code === originIATA);
        const destination = airportData.find(airport => airport.iata_code === destinationIATA);
        const metrics = origin && destination ? calculateMetrics(origin, destination, isRoundTrip, flightClassMultiplier) : null;
        updateFields(metrics, origin, destination);
        if (origin) addMarker(origin.latitude, origin.longitude);
        if (destination) addMarker(destination.latitude, destination.longitude);
    }

    function attachDropdown(inputField, airports) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'absolute';
        dropdownContainer.style.zIndex = '1000';
        dropdownContainer.style.backgroundColor = 'white';
        dropdownContainer.style.border = '1px solid #ccc';
        dropdownContainer.style.maxHeight = '150px';
        dropdownContainer.style.overflowY = 'auto';
        dropdownContainer.style.display = 'none';
        document.body.appendChild(dropdownContainer);

        function populateDropdown(inputField, airports) {
            dropdownContainer.innerHTML = '';
            const searchTerm = inputField.value.toLowerCase();
            const filteredAirports = airports.filter(airport =>
                airport.name.toLowerCase().includes(searchTerm) ||
                airport.municipality.toLowerCase().includes(searchTerm) ||
                airport.iata_code.toLowerCase().includes(searchTerm)
            ).slice(0, 4);
            filteredAirports.forEach(airport => {
                const option = document.createElement('div');
                option.textContent = `${airport.name} (${airport.iata_code})`;
                option.style.padding = '8px';
                option.style.cursor = 'pointer';
                option.addEventListener('click', () => {
                    inputField.value = `${airport.name}`;
                    inputField.dataset.iataCode = airport.iata_code;
                    dropdownContainer.style.display = 'none';
                    handleSelectionChange();
                });
                dropdownContainer.appendChild(option);
            });
            dropdownContainer.style.display = filteredAirports.length > 0 ? 'block' : 'none';
        }

        inputField.addEventListener('input', () => populateDropdown(inputField, airports));
        inputField.addEventListener('blur', () => setTimeout(() => dropdownContainer.style.display = 'none', 200));
    }

    attachDropdown(originDropdown, airportData);
    attachDropdown(destinationDropdown, airportData);

    originDropdown.addEventListener("input", handleSelectionChange);
    destinationDropdown.addEventListener("input", handleSelectionChange);
    roundTripCheckbox.addEventListener("change", handleSelectionChange);
    flightClassRadios.forEach(radio => radio.addEventListener("change", handleSelectionChange));
});
