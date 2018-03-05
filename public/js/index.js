var socket = io();

var mapboxStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w'
});

var map = L.map('map', {
    maxZoom: 18,
    layers: [mapboxStreets],
}).setView([38.760, -95.874], 5);
map.zoomControl.setPosition('topright');

var coordinates = '';
var x = 0;

map.on('click', function(e){
    
    var lat = e.latlng.lat.toString();
    var lng = e.latlng.lng.toString();
    
    if (x == 0) {
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        coordinates += `${lng},${lat}`;
    } else {
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        coordinates += `;${lng},${lat}`;
    };
    x += 1;
});

$('#submit').on('click', function(){
    socket.emit('get-coordinates', coordinates, function(callback){
        L.polyline(callback, {color: 'red'}).addTo(map);
    });
})