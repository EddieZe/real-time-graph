const socket = io();
let chart, currnetTime, initData = [], options;

let initdata = function () {
    currnetTime = (new Date()).getTime();
    for (let i = 0; i < 10; i++) {
        initData.push([currnetTime, 0, 0, 0, 0])
    }
};

let updateOptions = function () {
    options = {
        chart: {
            renderTo: 'graph_container',
            type: 'candlestick',
            events: {
                load: function () {
                    const series = this.series[0];
                    socket.on('newNumber', function (data) {
                        console.log(data);
                        series.addPoint(data, true, true);
                    });
                }
            }
        },
        title: {
            text: 'CandleStick Graph'
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 1000
        },

        series: [{
            name: 'time',
            data: initData
        }]
    };
};

$(document).ready(function () {
    initdata();
    updateOptions();
    chart = new Highcharts.Chart(options);
    $('#setInterval').on('change', function () {
        console.log($(this).val());
        socket.emit('updateInterval', $(this).val());
    });
});

socket.on('connect', function () {
    console.log('connected');
    $('span.status').addClass('connected');
    socket.emit('start')
});

socket.on('disconnect', function () {
    console.log('disconnect');
    $('span.status').removeClass('connected');
});