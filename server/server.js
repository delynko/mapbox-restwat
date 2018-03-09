require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const hbs = require('hbs');
const curl = require('curl');
const polyline = require('polyline');
const turf = require('@turf/turf');
const helper = require('@turf/helpers');
const MapboxClient = require('mapbox');

const port = process.env.PORT || 3000;

const datasetId = process.env.DATASET_ID;
const client = new MapboxClient(process.env.MAPBOX_PRIVATE);

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let restWat;
client.listFeatures(datasetId, {}, (err, collection) => {
    if (!err) {
        restWat = collection;
    } else {
        restWat = undefined;
        console.log('There was an error retrieving features');
    }
});

app.use(express.static(path.join(__dirname, '../public')));

app.set("views", path.resolve(__dirname, "../views"));
app.set("view engine", "hbs");

hbs.registerPartials(path.resolve(__dirname, '../views/partials'));

app.get('/', (req, res) => {
    res.render('index.hbs', {
        title: 'Choose Your Adventure'
    })
});

app.get('/restwatenroute', (req, res) => {
    res.render('route.hbs', {
        title: 'Mark your Route'
    });
});

app.get('/adddata', (req, res) => {
    res.render('adddata.hbs', {
        title: 'Add Restroom Data'
    });
});

app.get('/features', (req, res) => {
    client.listFeatures(datasetId, {}, function(err, collection) {
        res.send(collection);
    });
});

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('get-url-coordinates', (urlCoordinates, callback) => {

        curl.get(`https://api.mapbox.com/directions/v5/mapbox/cycling/${urlCoordinates}?access_token=${process.env.MAPBOX_PUBLIC}`, {
            roundtrip: false
        }, (err, response, body) => {
            const bodyParse = JSON.parse(body);

            const line = polyline.decode(bodyParse.routes[0].geometry);

            const bufferCoordinates = (lineCoords) => {
                const flipCoords = [];

                for (i = 0; i < lineCoords.length; i++) {

                    flipCoords.push([(lineCoords[i][1]), lineCoords[i][0]]);
                }
                return flipCoords
            };

            const lineForBuffer = helper.lineString(bufferCoordinates(line));

            const buffer = turf.buffer(lineForBuffer, 1000, {
                units: 'feet'
            });

            const pointsInBuffer = (buff) => {
                let pointsInBuffer = turf.pointsWithinPolygon(restWat, buff);
                socket.emit('restWat-points', pointsInBuffer);
            };

            pointsInBuffer(buffer);

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