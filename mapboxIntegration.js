document.addEventListener("DOMContentLoaded", async function () {
    const mapboxAccessToken = "pk.eyJ1IjoibGFzc29yLWZlYXNsZXkiLCJhIjoiY2xocTdpenBxMW1vcDNqbnUwaXZ3YjZvdSJ9.yAmcJgAq3-ts7qthbc4njg";
    const mapStyle = "mapbox://styles/lassor-feasley/cloonclal00bj01ns6c7q6aay";

    const mapContainer = document.getElementById("map-container"); // Ensure there's a div with this ID in your HTML

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
        const marker = new mapboxgl.Marker()
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML(popupText))
            .addTo(map);

        return marker;
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

        const sourceId = "animatedRoute";

        if (map.getSource(sourceId)) {
            map.removeLayer("routeLine");
            map.removeSource(sourceId);
        }

        map.addSource(sourceId, {
            type: "geojson",
            data: line
        });

        map.addLayer({
            id: "routeLine",
            type: "line",
            source: sourceId,
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
                const interpolatedCoords = route.map(([lng, lat], index) => {
                    const start = route[0][index];
                    const end = route[1][index];
                    return start + (end - start) * (i / steps);
                });

                line.geometry.coordinates.push(interpolatedCoords);
                map.getSource(sourceId).setData(line);
            }, i * interval);
        }
    }

    function updateMap(map, origin, destination) {
        if (!origin || !destination) {
            return;
        }

        // Clear existing markers if needed
        map.getContainer().querySelectorAll(".mapboxgl-marker").forEach(marker => marker.remove());

        // Add origin and destination markers
        addMarker(map, [origin.longitude, origin.latitude], `<b>Origin:</b> ${origin.name}`);
        addMarker(map, [destination.longitude, destination.latitude], `<b>Destination:</b> ${destination.name}`);

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
        const originIATA = document.getElementById("origin-dropdown").dataset.iataCode;
        const destinationIATA = document.getElementById("destination-dropdown").dataset.iataCode;

        const origin = originIATA ? airportData.find(airport => airport.iata_code === originIATA) : null;
        const destination = destinationIATA ? airportData.find(airport => airport.iata_code === destinationIATA) : null;

        updateMap(map, origin, destination);
    }

    document.getElementById("origin-dropdown").addEventListener("input", handleSelectionChange);
    document.getElementById("destination-dropdown").addEventListener("input", handleSelectionChange);

    map.on("load", () => handleSelectionChange());
});
