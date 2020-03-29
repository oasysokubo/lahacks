mapboxgl.accessToken =
"pk.eyJ1IjoiZ3psZWlzaW5nIiwiYSI6ImNrOGJmMnlzajA4OGUza3MyZ2gyNmRqZGEifQ.HDcR0vD84eVvS3mbM2eshA";
var map = new mapboxgl.Map({
container: "map",
style: "mapbox://styles/mapbox/navigation-guidance-night-v4",
center: [-118.2437, 34.0522],
zoom: 10,
minZoom: 10
});

let bounds = [
[-119, 33.5],
[-117.5, 34.5]
];

map.setMaxBounds(bounds);

map.addControl(
new MapboxDirections({
    accessToken: mapboxgl.accessToken
}),
"top-left"
);

map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

// HeatMap Layer
// map.on(btnPress, function(){})
map.on("load", function() {
map.addSource("traffic", {
    type: "geojson",
    data: "./static/traffic.geojson"
});

map.addLayer({
    id: "Accident Heatmap",
    type: "heatmap",
    source: "traffic",
    maxzoom: 15,
    layout: { visibility: "visible" },
    paint: {
        // increase weight as diameter breast height increases
        "heatmap-weight": {
            property: "dbh",
            type: "exponential",
            stops: [
                [1, 0],
                [62, 1]
            ]
        },
        // increase intensity as zoom level increases
        "heatmap-intensity": {
            stops: [
                [11, 1],
                [15, 3]
            ]
        },
        // assign color values be applied to points depending on their density
        "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(236,222,239,0)",
            0.2,
            "rgb(208,209,230)",
            0.4,
            "rgb(166,189,219)",
            0.6,
            "rgb(103,169,207)",
            0.8,
            "rgb(28,144,153)"
        ],
        // increase radius as zoom increases
        "heatmap-radius": {
            stops: [
                [11, 15],
                [15, 20]
            ]
        },
        // decrease opacity to transition into the circle layer
        "heatmap-opacity": {
            default: 1,
            stops: [
                [14, 1],
                [15, 0]
            ]
        }
    }
});

// Individual Points Layer
map.addLayer({
    id: "traffic-point",
    type: "circle",
    source: "traffic",
    minzoom: 14,
    layout: { visibility: "visible" },
    paint: {
        // increase the radius of the circle as the zoom level and dbh value increases
        "circle-radius": {
            property: "dbh",
            type: "exponential",
            stops: [
                [{ zoom: 15, value: 1 }, 5],
                [{ zoom: 15, value: 62 }, 10],
                [{ zoom: 22, value: 1 }, 20],
                [{ zoom: 22, value: 62 }, 50]
            ]
        },
        "circle-color": {
            property: "dbh",
            type: "exponential",
            stops: [
                [0, "rgba(236,222,239,0)"],
                [10, "rgb(236,222,239)"],
                [20, "rgb(208,209,230)"],
                [30, "rgb(166,189,219)"],
                [40, "rgb(103,169,207)"],
                [50, "rgb(28,144,153)"],
                [60, "rgb(1,108,89)"]
            ]
        },
        "circle-stroke-color": "white",
        "circle-stroke-width": 1,
        "circle-opacity": {
            stops: [
                [14, 0],
                [15, 1]
            ]
        }
    }
});
});

var toggleableLayerIds = ["Accident Heatmap"];

for (var i = 0; i < toggleableLayerIds.length; i++) {
var id = toggleableLayerIds[i];

var link = document.createElement("a");
link.href = "#";
link.className = "active";
link.textContent = id;

link.onclick = function(e) {
    var clickedLayer = this.textContent;
    console.log(clickedLayer);
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, "visibility");

    if (visibility === "visible") {
        map.setLayoutProperty(clickedLayer, "visibility", "none");
        if (clickedLayer == "Accident Heatmap") {
            map.setLayoutProperty(
                "traffic-point",
                "visibility",
                "none"
            );
        }
        this.className = "";
    } else {
        this.className = "active";
        map.setLayoutProperty(clickedLayer, "visibility", "visible");
        if (clickedLayer == "Accident Heatmap") {
            map.setLayoutProperty(
                "traffic-point",
                "visibility",
                "visible"
            );
        }
    }
};

var layers = document.getElementById("menu");
layers.appendChild(link);
}

// Use the coordinates you drew to make the Map Matching API request
function updateRoute() {
// Set the profile
var profile = "driving";
// Get the coordinates that were drawn on the map
var data = draw.getAll();
var lastFeature = data.features.length - 1;
var coords = data.features[lastFeature].geometry.coordinates;
// Format the coordinates
var newCoords = coords.join(";");
// Set the radius for each coordinate pair to 25 meters
var radius = [];
coords.forEach(element => {
    radius.push(25);
});
getMatch(newCoords, radius, profile);
}

// Make a Map Matching request
function getMatch(coordinates, radius, profile) {
// Separate the radiuses with semicolons
var radiuses = radius.join(";");
// Create the query
var query =
    "https://api.mapbox.com/matching/v5/mapbox/" +
    profile +
    "/" +
    coordinates +
    "?geometries=geojson&radiuses=" +
    radiuses +
    "&steps=true&access_token=" +
    mapboxgl.accessToken;

$.ajax({
    method: "GET",
    url: query
}).done(function(data) {
    // Get the coordinates from the response
    var coords = data.matchings[0].geometry;
    console.log(coords);
    // Code from the next step will go here
});
}