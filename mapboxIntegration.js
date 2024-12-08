document.addEventListener("DOMContentLoaded", async function () {
    const mapboxAccessToken = "pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg";
    const mapStyle = "mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay";

    const mapContainer = document.getElementById("map-container"); // Ensure there's a div with this ID in your HTML

    let originMarker = null;
    let destinationMarker = null;
    let routeSourceId = "animatedRoute";

    function initializeMap() {
        const map = new mapboxgl.Map({
            container: mapContainer,
            style: mapStyle,
            center: [0, 0],
            zoom: 2,
            accessToken: mapboxAccessToken
        });

        return map;
    }

    function addMarker(map, coords, popupText) {
        return new mapboxgl.Marker()
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML(popupText))
            .addTo(map);
    }

    function updateMarkers(map, origin, destination) {
        // Clear existing markers
        if (originMarker) {
            originMarker.remove();
        }
        if (destinationMarker) {
            destinationMarker.remove();
        }

        // Add new markers
        if (origin) {
            originMarker = addMarker(map, [origin.longitude, origin.latitude], `<b>Origin:</b> ${origin.name}`);
        }
        if (destination) {
            destinationMarker = addMarker(map, [destination.longitude, destination.latitude], `<b>Destination:</b> ${destination.name}`);
        }
    }

    async function animateRoute(map, origin, destination) {
        const route = [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude]
        ];

        const line = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: []
            }
        };

        if (map.getSource(routeSourceId)) {
            map.removeLayer("routeLine");
            map.removeSource(routeSourceId);
        }

        map.addSource(routeSourceId, {
            type: "geojson",
            data: line
        });

        map.addLayer({
            id: "routeLine",
            type: "line",
            source: routeSourceId,
            layout: {},
            paint: {
                "line-color": "#007cbf",
                "line-width": 4
            }
        });

        const steps = 60; // Smoothness of animation
        const interval = 3000 / steps; // Animation duration divided by steps

        for (let i = 0; i <= steps; i++) {
            setTimeout(() => {
                const interpolatedCoords = [
                    route[0][0] + (route[1][0] - route[0][0]) * (i / steps),
                    route[0][1] + (route[1][1] - route[0][1]) * (i / steps)
                ];
                line.geometry.coordinates.push(interpolatedCoords);
                map.getSource(routeSourceId).setData(line);
            }, i * interval);
        }
    }

    function updateMap(map, origin, destination) {
        if (!origin || !destination) {
            console.log("Missing origin or destination.");
            return;
        }

        // Update markers
        updateMarkers(map, origin, destination);

        // Fly to bounds
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([origin.longitude, origin.latitude]);
        bounds.extend([destination.longitude, destination.latitude]);
        map.fitBounds(bounds, { padding: 50 });

        // Animate the route
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
        const originDropdown = document.getElementById("origin-dropdown");
        const destinationDropdown = document.getElementById("destination-dropdown");

        const originIATA = originDropdown.dataset.iataCode;
        const destinationIATA = destinationDropdown.dataset.iataCode;

        console.log("Origin IATA:", originIATA);
        console.log("Destination IATA:", destinationIATA);

        const origin = originIATA ? airportData.find(airport => airport.iata_code === originIATA) : null;
        const destination = destinationIATA ? airportData.find(airport => airport.iata_code === destinationIATA) : null;

        console.log("Origin:", origin);
        console.log("Destination:", destination);

        updateMap(map, origin, destination);
    }

    document.getElementById("origin-dropdown").addEventListener("input", handleSelectionChange);
    document.getElementById("destination-dropdown").addEventListener("input", handleSelectionChange);

    map.on("load", () => handleSelectionChange());
});
