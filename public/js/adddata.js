const socket = io();

const mapboxStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets-satellite',
    accessToken: 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w',
});

const map = L.map('map', {
    maxZoom: 18,
    layers: [mapboxStreets],
}).setView([38.760, -95.874], 5);
map.zoomControl.setPosition('topright');

const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: false,
        circlemarker: false
    },
});
map.addControl(drawControl);

displayPoints();

map.on(L.Draw.Event.CREATED, function(e){
    coordinates = [e.layer._latlng.lng, e.layer._latlng.lat];
    
    L.marker([coordinates[1], coordinates[0]]).addTo(map);
});


function displayPoints(){
    $.get('/features', function(data) {
        L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                if (layer.feature.properties.TOILET_TYP == 'F') {
                    layer.setIcon(new L.icon({
                        iconUrl: "images/rest-water.png",
                        iconSize: [20, 20]
                    })).bindPopup('Toilet and Water');
                } else if (layer.feature.properties.TOILET_TYP == 'V' || layer.feature.properties.TOILET_TYP == 'P' || layer.feature.properties.TOILET_TYP == 'C') {
                    layer.setIcon(new L.icon({
                        iconUrl: "images/toilet.png",
                        iconSize: [20, 20]
                    })).bindPopup('Toilet Only');
                } else {
                    layer.setIcon(new L.icon({
                        iconUrl: "images/water.png",
                        iconSize: [20, 20]
                    })).bindPopup('Water Only');
                }
            }
        }).addTo(map);
    });
}