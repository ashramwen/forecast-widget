const refresh_rate = 600000; // Time in milliseconds between refreshes

var url = 'https://t21r5zo6sk.execute-api.ap-northeast-2.amazonaws.com/prod/forecast';

// setInterval(function () {
$.get(url, function (data) {
    console.log(data);
});
// }, conf.refresh_rate);