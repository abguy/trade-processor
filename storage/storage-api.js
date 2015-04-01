var http = require('http');
var path = require('path');
var redis = require('redis');

var env = process.env.NODE_ENV || 'production';
var config = require(path.join(__dirname, 'config', 'config.json'))[env];
var port = parseInt(config.port, 10);

var lastRatesNumber = parseInt(config.lastRatesNumber, 10);

var redisPort = parseInt(config.redisPort, 10);
var client = redis.createClient(redisPort, config.redisHost);
client.on('error', function (err) {
    console.log('Redis connection error: ' + err);
});

http.createServer(function (request, response) {
    if ('POST' == request.method) {
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            function tryParseJson(str) {
                try {
                    return JSON.parse(str);
                } catch (ex) {
                    return null;
                }
            }

            var data = tryParseJson(body);
            if (null == data) {
                return;
            }

            data.flows = data.flows || [];
            data.messages = parseInt(data.messages || 0, 10);
            data.countries = data.countries || {};

            var multi = client.multi();

            multi.incrby('batch', 1);
            multi.incrby('messages', data.messages);

            for (var country in data.countries) {
                if (!data.countries.hasOwnProperty(country)) {
                    continue;
                }
                multi.hincrby('countries', country.toUpperCase(), parseInt(data.countries[country], 10));
            }

            for (var i = 0; i < data.flows.length; i++) {
                var flow = data.flows[i];
                if (!flow.source || !flow.target) {
                    console.log('Wrong format of flow: ' + JSON.stringify(flow));
                    continue;
                }

                var source = flow.source.toUpperCase();
                var target = flow.target.toUpperCase();
                flow.from = parseFloat(flow.from || 0, 10);
                flow.to = parseFloat(flow.to || 0, 10);
                flow.rate = parseFloat(flow.rate || 0, 10);

                multi.sadd('currencies', source, target);
                multi.hincrbyfloat('flows', source + ':from:' + target, flow.from);
                multi.hincrbyfloat('flows', source + ':to:' + target, flow.to);

                multi.rpush('rates:' + source + ':' + target, flow.rate);
                multi.ltrim('rates:' + source + ':' + target, 0, lastRatesNumber - 1);
            }

            multi.publish(config.redisChannel, 'New data');
            multi.exec(config.logging ? redis.print : null);
        });
    }

    response.writeHead(204);
    response.end();
}).listen(port, config.host);

console.log('Listening on http://' + config.host + ':' + port);
