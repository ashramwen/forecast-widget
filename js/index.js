const refresh_rate = 600000; // Time in milliseconds between refreshes

var url = 'https://t21r5zo6sk.execute-api.ap-northeast-2.amazonaws.com/prod/forecast';

var units = 'si';

var unit_labels = {
    auto: {
        speed: 'mph'
    },
    us: {
        speed: 'mph'
    },
    si: {
        speed: 'm/s'
    },
    ca: {
        speed: 'km/h'
    },
    uk: {
        speed: 'mph'
    }
};

var dayMapping = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
};

setInterval(function () {
    $.get(url, function (data) {
        console.log(data);
        update(data);
    });
}, refresh_rate);

function update(output) {
    // Temperature direction (rising or falling)
    var next_hour_temp = output.hourly.data[1].temperature; // Next hour's temp
    var current_temp = output.currently.temperature; // Current temp
    if (next_hour_temp > current_temp) {
        $('#temp-direction').text('and rising');
    } else {
        $('#temp-direction').text('and falling');
    }

    // Temperature and summary
    $('.fe-temp').text(Math.round(current_temp));
    $('.fe-summary').text(output.currently.summary);

    // Wind speed and bearing
    var wind_speed = Math.round(output.currently.windSpeed);
    var wind_speed_units = unit_labels[units || 'us'].speed;
    var wind_bearing = bearing(output.currently.windBearing);
    $('.fe-wind').text('Wind: ' + wind_speed + ' ' + wind_speed_units + ' (' + wind_bearing + ')');

    // Icon
    changeIcon($('#fe-current-icon'), output.currently.icon);

    // TODO: Check if there is a output.weekly.high / low
    // Find the max and min temperatures for the week
    var temp_min_week = 1000;
    var temp_max_week = -1000;
    for (var day in output.daily.data) {
        if (output.daily.data[day].temperatureMax > temp_max_week) {
            temp_max_week = output.daily.data[day].temperatureMax;
        }
        if (output.daily.data[day].temperatureMin < temp_min_week) {
            temp_min_week = output.daily.data[day].temperatureMin;
        }
    }

    for (day in output.daily.data) {

        // Change current day's name
        if (day === '0') {
            $('#day' + day).find('.day-text').text('Tod');
        } else {
            $('#day' + day).find('.day-text').text(this.dayMapping[new Date(output.daily.data[day].time * 1000).getDay()]);
        }

        // Set day's weather icon
        changeIcon($('#day' + day).find('.weather-icon'), output.daily.data[day].icon);

        // Temperature bars
        var day_high = Math.round(output.daily.data[day].temperatureMax) + '°';
        var day_low = Math.round(output.daily.data[day].temperatureMin) + '°';
        var day_high_rel = map(output.daily.data[day].temperatureMax, temp_min_week, temp_max_week, 0, 1);
        var day_low_rel = map(output.daily.data[day].temperatureMin, temp_min_week, temp_max_week, 0, 1);
        var height = 100;
        $('#day' + day).find('.bar').attr('data-content-high', day_high);
        $('#day' + day).find('.bar').attr('data-content-low', day_low);
        $('#day' + day).find('.bar').css('top', height - (day_high_rel * height));
        $('#day' + day).find('.bar').css('bottom', day_low_rel * height);
    }
    // Makes the widget visible after it's loaded
    $('.fe-forecast').removeClass('loading');
}

function changeIcon(element, icon) {
    if (element.css('-webkit-mask-image') !== 'url(' + window.location.origin + '/icons/' + icon + '.png)') {
        if (element.css('-webkit-mask-image') === 'url(' + window.location.origin + '/)') {
            element.addClass('loading');
            element.addClass('prepare-loading');
            element.css('-webkit-mask-image', 'url(icons/' + icon + '.png)');
            element.removeClass('loading');
            setTimeout(function () {
                element.removeClass('prepare-loading');
            }, 500);
        } else {
            element.addClass('prepare-loading');
            element.addClass('loading');
            setTimeout(function () {
                element.css('-webkit-mask-image', 'url(icons/' + icon + '.png)');
                element.removeClass('loading');
                setTimeout(function () {
                    element.removeClass('prepare-loading');
                }, 500);
            }, 500);
        }
    }
}

function bearing(bearing) {
    var direction_index = Math.round(bearing / 45);
    return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'][direction_index];
}

function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}