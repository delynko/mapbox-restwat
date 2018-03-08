var socket = io();

var mapboxStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets-satellite',
    accessToken: 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w',
});

var map = L.map('map', {
    maxZoom: 18,
    layers: [mapboxStreets],
}).setView([37.229508312347555, -112.96417236328126], 14);
map.zoomControl.setPosition('topright');

var urlCoordinates = '';
var x = 0;

map.on('click', function (e) {

    var rteStop = L.marker([e.latlng.lat, e.latlng.lng]);
    map.addLayer(rteStop);

    var lat = e.latlng.lat.toString();
    var lng = e.latlng.lng.toString();

    if (x == 0) {
        urlCoordinates += `${lng},${lat}`;
    } else {
        urlCoordinates += `;${lng},${lat}`;
    };
    x += 1;

});

$('#submit').on('click', function () {
    map.removeEventListener('click');
    socket.emit('get-url-coordinates', urlCoordinates, function (callback) {
        var route = L.polyline(callback, {
            color: 'red'
        });
        map.addLayer(route);
    });
});

socket.on('restWat-points', function (points) {
    L.geoJSON(points, {
        onEachFeature: function (feature, layer) {
            if (layer.feature.properties.TOILET_TYP == 'F') {
                layer.setIcon(new L.icon({
                    iconUrl: "images/rest-water.png",
                    iconSize: [20, 20]
                }));
            } else if (layer.feature.properties.TOILET_TYP == 'V') {
                layer.setIcon(new L.icon({
                    iconUrl: "images/toilet.png",
                    iconSize: [20, 20]
                }));
            } else {
                layer.setIcon(new L.icon({
                    iconUrl: "images/water.png",
                    iconSize: [20, 20]
                }));
            }
        }
    }).addTo(map);
})