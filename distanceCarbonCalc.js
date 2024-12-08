document.addEventListener("DOMContentLoaded", async function () {
    const mapboxAccessToken = "pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg"; // Replace with your Mapbox token
    const mapStyle = "mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay"; // Replace with your Mapbox style URL

    // Initialize the Mapbox map
    mapboxgl.accessToken = mapboxAccessToken;
    const map = new mapboxgl.Map({
        container: 'map', // ID of the map container element
        style: mapStyle,
        center: [0, 0], // Default center [longitude, latitude]
        zoom: 2 // Default zoom level
    });

    let markers = [];
    let routeLine = null;

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

    function addMarker(latitude, longitude) {
        console.log(Attempting to add marker at: ${latitude}, ${longitude}); // Debug log
        const marker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);

        markers.push(marker);

        console.log(Markers array:, markers); // Debug log

        if (markers.length === 2) {
            drawRoute(markers[0].getLngLat(), markers[1].getLngLat());
        }
    }

    function drawRoute(start, end) {
        console.log(Drawing route from ${start} to ${end}); // Debug log
        if (routeLine) {
            map.removeLayer("route");
            map.removeSource("route");
        }

        const route = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [start.lng, start.lat],
                    [end.lng, end.lat]
                ]
            }
        };

        map.addSource("route", {
            type: "geojson",
            data: route
        });

        map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {},
            paint: {
                "line-color": "#ff0000",
                "line-width": 4
            }
        });

        animateRoute(route.geometry.coordinates);
    }

    function animateRoute(coordinates) {
        console.log(Animating route:, coordinates); // Debug log
        const frames = 180; // 3 seconds at 60fps
        const step = 1 / frames;

        let i = 0;
        const animatedCoordinates = [coordinates[0]];

        function animate() {
            if (i < 1) {
                const interpolatedPoint = [
                    coordinates[0][0] + (coordinates[1][0] - coordinates[0][0]) * i,
                    coordinates[0][1] + (coordinates[1][1] - coordinates[0][1]) * i
                ];

                animatedCoordinates.push(interpolatedPoint);
                map.getSource("route").setData({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: animatedCoordinates
                    }
                });

                i += step;
                requestAnimationFrame(animate);
            } else {
                // Complete the line animation
                map.getSource("route").setData({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: coordinates
                    }
                });
            }
        }

        animate();
    }

    // Event listener for airport selection
    function handleAirportSelection(lat, lng, isOrigin) {
        if (isNaN(lat) || isNaN(lng)) {
            console.error(Invalid coordinates: lat=${lat}, lng=${lng}); // Debug log for invalid data
            return;
        }

        addMarker(lat, lng);

        if (isOrigin) {
            map.flyTo({ center: [lng, lat], zoom: 6 });
        }
    }

    const airportData = await fetchAirportData();

    function attachDropdown(inputField, airports) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'absolute';
        dropdownContainer.style.zIndex = '1000';
        dropdownContainer.style.backgroundColor = 'white';
        dropdownContainer.style.border = '1px solid #ccc';
        dropdownContainer.style.maxHeight = '150px';
        dropdownContainer.style.overflowY = 'auto';
        dropdownContainer.style.display = 'none'; // Hidden by default
        document.body.appendChild(dropdownContainer);

        function populateDropdown(inputField, dropdownContainer, airports) {
            dropdownContainer.innerHTML = ''; // Clear existing options
            const searchTerm = inputField.value.toLowerCase();

            const filteredAirports = airports.filter(airport =>
                airport.name.toLowerCase().includes(searchTerm) ||
                airport.municipality.toLowerCase().includes(searchTerm) ||
                airport.iata_code.toLowerCase().includes(searchTerm)
            ).slice(0, 4); // Limit to top 4 results

            if (filteredAirports.length > 0) {
                filteredAirports.forEach((airport, index) => {
                    const option = document.createElement('div');
                    option.style.padding = '8px';
                    option.style.cursor = 'pointer';
                    option.style.borderBottom = '1px solid #ddd';
                    option.textContent = ${airport.name} (${airport.iata_code});

                    if (index === 0) {
                        option.style.backgroundColor = '#f0f0f0';
                    }

                    option.addEventListener('mouseover', function () {
                        option.style.backgroundColor = '#e0e0e0';
                    });

                    option.addEventListener('mouseout', function () {
                        option.style.backgroundColor = index === 0 ? '#f0f0f0' : 'white';
                    });

                    option.addEventListener('click', function () {
                        inputField.value = ${airport.name};
                        inputField.dataset.iataCode = airport.iata_code;
                        dropdownContainer.style.display = 'none';
                        const lat = airport.latitude;
                        const lng = airport.longitude;
                        handleAirportSelection(lat, lng, inputField.id === "origin-dropdown");
                    });

                    dropdownContainer.appendChild(option);
                });
                dropdownContainer.style.display = 'block'; // Show dropdown
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
                dropdownContainer.style.top = ${window.scrollY + rect.bottom}px;
                dropdownContainer.style.left = ${window.scrollX + rect.left}px;
                dropdownContainer.style.width = ${inputField.offsetWidth}px;
                populateDropdown(inputField, dropdownContainer, airports);
            } else {
                dropdownContainer.style.display = 'none'; // Hide dropdown if input is empty
            }
        });

        inputField.addEventListener('blur', function () {
            setTimeout(() => {
                dropdownContainer.style.display = 'none';
            }, 200); // Slight delay to allow selection
        });

        inputField.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const firstOption = dropdownContainer.querySelector('div');
                if (firstOption) {
                    firstOption.click();
                    event.preventDefault(); // Prevent form submission or default behavior
                }
            }
        });
    }

    attachDropdown(document.getElementById("origin-dropdown"), airportData);
    attachDropdown(document.getElementById("destination-dropdown"), airportData);
});
