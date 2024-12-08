document.addEventListener("DOMContentLoaded", async function () {
    const mapContainer = document.getElementById("map-container"); // Ensure there's a div with this ID in your HTML

    function initializeMap() {
        const map = L.map(mapContainer).setView([0, 0], 2); // Initialize map centered at 0,0 with zoom level 2

        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            id: "lassor-feasley/cloonclal00bj01ns6c7q6aay",
            accessToken: "pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg",
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 19,
        }).addTo(map);

        return map;
    }

    async function animateRoute(map, origin, destination) {
        const latlngs = [
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude]
        ];

        const routeLine = L.polyline([], { color: 'blue', weight: 3 }).addTo(map);

        for (let i = 0; i < latlngs.length - 1; i++) {
            const start = latlngs[i];
            const end = latlngs[i + 1];

            const steps = 60; // Smoothness of animation
            const interval = 3000 / steps; // Animation duration divided by steps

            for (let j = 0; j <= steps; j++) {
                setTimeout(() => {
                    const lat = start[0] + (end[0] - start[0]) * (j / steps);
                    const lng = start[1] + (end[1] - start[1]) * (j / steps);
                    routeLine.addLatLng([lat, lng]);
                }, j * interval);
            }
        }
    }

    function updateMap(map, origin, destination) {
        if (!origin || !destination) {
            return;
        }

        // Clear existing markers and routes
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        // Add markers for origin and destination
        const originMarker = L.marker([origin.latitude, origin.longitude]).addTo(map)
            .bindPopup(`<b>Origin:</b> ${origin.name}`).openPopup();

        const destinationMarker = L.marker([destination.latitude, destination.longitude]).addTo(map)
            .bindPopup(`<b>Destination:</b> ${destination.name}`).openPopup();

        // Fit map to bounds of the markers
        const bounds = L.latLngBounds([
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude]
        ]);
        map.fitBounds(bounds);

        // Animate the route between origin and destination
        animateRoute(map, origin, destination);
    }

    const map = initializeMap(); // Initialize the map

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

    const airportData = await fetchAirportData();

    function handleSelectionChange() {
        const originIATA = document.getElementById("origin-dropdown").dataset.iataCode;
        const destinationIATA = document.getElementById("destination-dropdown").dataset.iataCode;

        const origin = originIATA ? airportData.find(airport => airport.iata_code === originIATA) : null;
        const destination = destinationIATA ? airportData.find(airport => airport.iata_code === destinationIATA) : null;

        updateMap(map, origin, destination);
    }

    document.getElementById("origin-dropdown").addEventListener("input", handleSelectionChange);
    document.getElementById("destination-dropdown").addEventListener("input", handleSelectionChange);
});

