document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");
    const roundTripCheckbox = document.getElementById("roundtrip-checkbox");
    const flightClassRadios = document.querySelectorAll("input[name='class']");

    const originCoordinatesField = document.getElementById("Origin-coordinates");
    const destinationCoordinatesField = document.getElementById("Destination-coordinates");
    const totalMilesField = document.getElementById("Total-miles");
    const carbonCostField = document.getElementById("carbon-cost");
    const panelsToOffsetField = document.getElementById("panels-to-offset");

    let originMarker, destinationMarker;
    let lastFlyToCenter = null;

    mapboxgl.accessToken = 'pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay',
        center: [0, 0],
        zoom: 2 // Fixed zoom level
    });

    // Disable zoom interaction
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();

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
        const R = 6371;
        const toRadians = degrees => degrees * (Math.PI / 180);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function calculateMetrics(origin, destination, isRoundTrip, flightClassMultiplier) {
        const distance = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
        const roundTripMultiplier = isRoundTrip ? 2 : 1;
        const totalDistance = distance * roundTripMultiplier;

        const carbonCost = totalDistance * flightClassMultiplier;
        const panelsNeeded = Math.ceil(carbonCost * 0.01);

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

    function updateMap(origin, destination) {
        if (origin) {
            if (originMarker) originMarker.remove();
            originMarker = new mapboxgl.Marker({ color: '#0F4C81' })
                .setLngLat([origin.longitude, origin.latitude])
                .addTo(map);
        }

        if (destination) {
            if (destinationMarker) destinationMarker.remove();
            destinationMarker = new mapboxgl.Marker({ color: '#0F4C81' })
                .setLngLat([destination.longitude, destination.latitude])
                .addTo(map);
        }

        let flyToCenter = null;
        if (origin && destination) {
            const midLongitude = (origin.longitude + destination.longitude) / 2;
            const midLatitude = (origin.latitude + destination.latitude) / 2;
            flyToCenter = [midLongitude, midLatitude];

            if (map.getSource('flight-path')) {
                map.removeLayer('flight-path');
                map.removeSource('flight-path');
            }

            map.addSource('flight-path', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [origin.longitude, origin.latitude],
                            [destination.longitude, destination.latitude]
                        ]
                    }
                }
            });

            map.addLayer({
                id: 'flight-path',
                type: 'line',
                source: 'flight-path',
                layout: {},
                paint: {
                    'line-color': 'white',
                    'line-width': 4,
                    'line-dasharray': [0, 2]
                }
            });

            function animateDashArray(timestamp) {
                const dashArray = map.getPaintProperty('flight-path', 'line-dasharray');
                dashArray[0] = (dashArray[0] + 0.1) % 2;
                dashArray[1] = (dashArray[1] + 0.1) % 2;
                map.setPaintProperty('flight-path', 'line-dasharray', dashArray);

                requestAnimationFrame(animateDashArray);
            }

            animateDashArray(0);
        } else if (origin) {
            flyToCenter = [origin.longitude, origin.latitude];
        } else if (destination) {
            flyToCenter = [destination.longitude, destination.latitude];
        }

        if (flyToCenter && (!lastFlyToCenter || flyToCenter[0] !== lastFlyToCenter[0] || flyToCenter[1] !== lastFlyToCenter[1])) {
            lastFlyToCenter = flyToCenter;
            map.easeTo({ center: flyToCenter, zoom: 2, essential: true }); // Smooth easing animation
        }
    }

    const airportData = await fetchAirportData();

    function handleSelectionChange() {
        const originIATA = originDropdown.dataset.iataCode;
        const destinationIATA = destinationDropdown.dataset.iataCode;
        const isRoundTrip = !roundTripCheckbox.checked;

        const flightClassMultiplier = parseFloat(Array.from(flightClassRadios).find(radio => radio.checked)?.value || 0.15);

        const origin = originIATA ? airportData.find(airport => airport.iata_code === originIATA) : null;
        const destination = destinationIATA ? airportData.find(airport => airport.iata_code === destinationIATA) : null;

        const metrics = origin && destination ? calculateMetrics(origin, destination, isRoundTrip, flightClassMultiplier) : null;
        updateFields(metrics, origin, destination);
        updateMap(origin, destination);
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

    attachDropdown(originDropdown, airportData);
    attachDropdown(destinationDropdown, airportData);

    originDropdown.addEventListener("input", handleSelectionChange);
    destinationDropdown.addEventListener("input", handleSelectionChange);
    roundTripCheckbox.addEventListener("change", handleSelectionChange);
    flightClassRadios.forEach(radio => radio.addEventListener("change", handleSelectionChange));

    handleSelectionChange();
});
