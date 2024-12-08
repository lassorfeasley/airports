document.addEventListener("DOMContentLoaded", function () {
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

    function addMarker(latitude, longitude) {
        const marker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);

        markers.push(marker);

        if (markers.length === 2) {
            drawRoute(markers[0].getLngLat(), markers[1].getLngLat());
        }
    }

    function drawRoute(start, end) {
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
        addMarker(lat, lng);

        if (isOrigin) {
            map.flyTo({ center: [lng, lat], zoom: 6 });
        }
    }

    // Mock integration with dropdown selection
    document.getElementById("origin-dropdown").addEventListener("change", function (e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const lat = parseFloat(selectedOption.dataset.lat);
        const lng = parseFloat(selectedOption.dataset.lng);
        handleAirportSelection(lat, lng, true);
    });

    document.getElementById("destination-dropdown").addEventListener("change", function (e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const lat = parseFloat(selectedOption.dataset.lat);
        const lng = parseFloat(selectedOption.dataset.lng);
        handleAirportSelection(lat, lng, false);
    });
});

