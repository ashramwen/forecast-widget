'use strict';

console.log('Loading function');

const https = require('https');

const conf = {
    api: 'https://api.darksky.net/forecast/',
    api_key: '99d8a26791e225b05f3c367d80cfbbeb',
    lat: '25.0494',
    lon: '121.5756',
    units: 'si'
};

const url = conf.api + conf.api_key + '/' + conf.lat + ',' + conf.lon + '?units=' + conf.units + '&exclude=minutely,alerts,flags';

exports.handler = (event, context, callback) => {
    https.get(url, function (res) {
        var str = '';
        res.on('data', (d) => {
            str += d;
        });
        res.on('end', function () {
            callback(null, {
                statusCode: '200',
                body: str,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });
    }).on('error', function (e) {
        callback(e);
    });
};