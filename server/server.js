require('dotenv').config();
const express = require('express');
const MapboxClient = require('mapbox');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const hbs = require('hbs');
const curl = require('curl');
const polyline = require('polyline');

const port = process.env.PORT || 3000;

const datasetId = process.env.DATASET_ID;
const client = new MapboxClient(process.env.MAPBOX_PRIVATE);

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(path.join(__dirname, '../public')));

app.set("views", path.resolve(__dirname, "../views"));
app.set("view engine", "hbs");

hbs.registerPartials(path.resolve(__dirname, '../views/partials'));


app.get('/', (req, res) => {
    res.render('index.hbs');
});

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('get-coordinates', (data, callback) => {

        curl.get(`https://api.mapbox.com/directions/v5/mapbox/cycling/${data}?access_token=${process.env.MAPBOX_PUBLIC}`, {
            roundtrip: false
        }, (err, response, body) => {
            var bodyParse = JSON.parse(body);

            var line = polyline.decode(bodyParse.routes[0].geometry);
            callback(line);
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log(`listening on ${port}`);
});