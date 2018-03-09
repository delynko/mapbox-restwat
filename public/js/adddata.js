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
}).setView([37.229508312347555, -112.96417236328126], 14);
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

function displayPoints(){
    $.get('/features', function(data) {
        console.log(data);
        for (let i = 0; i < data.features.length; i++) {
            
            const point = L.marker([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]);
            
            map.addLayer(point);
            
        };
    });
}