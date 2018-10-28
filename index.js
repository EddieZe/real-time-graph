const port = 3000;
const express = require('express');
const path = require('path');
const EventEmitter = require('events');
const randomNumberEmitter = new EventEmitter();
const app = express();

let intervalUpdateTime = 10000, data = [], currentTime, timer;
let periodSum = 0, periodMin, periodMax, firstInPeriod, lastInPeriod;

app.use(express.static(path.join(__dirname, 'static')));

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

let config = {
    defaultEventRate: 100
};

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.on('start', function () {
        console.log('starting');
        randomNumberEmitter.on('newNumber', function (number) {
            socket.emit('newNumber', number)
        })
    });

    socket.on('updateInterval', function (newInterval) {
        clearInterval(timer);
        intervalUpdateTime = newInterval;
        console.log('New interval: ' + newInterval);
        startSendingValues();
    })

});

let startSendingValues = function () {
    timer = setInterval(function () {
        for (let i = 0; i < config.defaultEventRate; i++) {
            let number = Math.floor(Math.random() * Math.floor(20));
            if (periodSum === 0) {
                periodSum = number;
                firstInPeriod = number;
                periodMin = number;
                periodMax = number;
            }
            else {
                periodSum += number;
                lastInPeriod = number;
                periodMin = periodMin > number ? number : periodMin;
                periodMax = periodMax < number ? number : periodMax;
            }
        }
        currentTime = Date.now();
        data = [currentTime, firstInPeriod, periodMax, periodMin, lastInPeriod];
        randomNumberEmitter.emit('newNumber', data);
        periodSum = 0;
    }, intervalUpdateTime);
};

server.listen(port, function () {
    startSendingValues();
    console.log('server listetning on port', port);
});
