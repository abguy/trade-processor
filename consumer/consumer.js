"use strict";

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var http = require('http');
var path = require('path');
var fs = require('fs');
var amqplib = require('amqplib');

var env = process.env.NODE_ENV || 'production';
var config = require(path.join(__dirname, 'config', 'config.json'))[env];

var debug, debugModule = require('debug');

if (cluster.isMaster) {
    config.logging && debugModule.enable('cluster');
    debug = debugModule('cluster');

    cluster.setupMaster({
        exec: __filename,
        silent: !config.logging
    });

    // Fork workers.
    // Make sure that one CPU is available for master and other stuff.
    for (var j = 0; j < Math.max(numCPUs - 1, 1); j++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        if (worker.suicide) {
            return;
        }
        debug('Worker  %d died (%s). Restarting...', worker.process.pid, signal || code);
        cluster.fork();
    });

    cluster.on('fork', function(worker) {
        debug('Worker %d started.', worker.process.pid);
    });

    process.on('SIGINT',function() {
        // Prevent process from exiting immediately
        setTimeout(function() {
            debug('Exiting...');
            process.exit(0);
        }, 1000);

        for (var id in cluster.workers) {
            if (cluster.workers.hasOwnProperty(id)) {
                cluster.workers[id].kill();
            }
        }
    });

    return;
}

config.logging && debugModule.enable('worker');
debug = debugModule('worker');

var opts = {
    cert: fs.readFileSync(path.join(__dirname, 'config', 'certs', config.rabbitClientCert)),
    key: fs.readFileSync(path.join(__dirname, 'config', 'certs', config.rabbitClientKey)),
    passphrase: config.rabbitClientKeyPassPhrase,
    ca: [fs.readFileSync(path.join(__dirname, 'config', 'certs', config.rabbitCaCert))],
    noDelay: true,
    heartbeat: config.rabbitConnectionHeartbeat
};

// Open several connections to the RabbitMQ in order to increase throughput
var currentChannelNumber = 0;
var rabbitChannels = [];
for (var i = 0; i < config.rabbitConnectionsPerWorker; i++) {
    rabbitChannels.push(
        amqplib.connect(
            'amqps://' + encodeURIComponent(config.rabbitUser) + ':'  + encodeURIComponent(config.rabbitPassword) +
                '@' + config.rabbitServer + ':' + config.rabbitPort + '/' + encodeURIComponent(config.rabbitVhost),
            opts
        ).then(function(connection) {
            return connection.createChannel().then(function(channel) {
                return channel.assertQueue('messages', {
                    exclusive: false,
                    durable: true
                }).then(function(queue) {
                    return new Promise(function(resolve) {
                        resolve(channel);
                    });
                });
            });
        }, function(err) {
            console.error('Connect to the RabbitMQ failed: %s', err);
        })
    );
}

function closerRabbitChannels() {
    rabbitChannels.forEach(function(channelPromise) {
        channelPromise.then(function(channel) {
            channel.close();
            channel.connection.close();
        });
    });
}
process.on('SIGINT', function() {
    // Prevent process from exiting immediately
    setTimeout(function() {
        debug('Exiting...');
        process.exit(0);
    }, 1000);
    closerRabbitChannels();
});
cluster.worker.on('exit', closerRabbitChannels);
process.on('exit', closerRabbitChannels);


// Workers can share any TCP connection
// In our case its a HTTP server
var httpPort = parseInt(config.port, 10);
http.createServer(function (request, response) {
    if ('POST' == request.method) {
        var body = null;

        request.on('data', function (data) {
            body = (null === body) ? data : Buffer.concat([body, data]);

            // Too much POST data, kill the connection!
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            currentChannelNumber = (currentChannelNumber + 1) % config.rabbitConnectionsPerWorker;
            var channelPromise = rabbitChannels[currentChannelNumber];
            channelPromise.then(function(channel) {
                channel.sendToQueue('messages', body, {
                    persistent: true // or deliveryMode: 2
                });
            });
        });
    }
    response.writeHead(204);
    response.end();
}).listen(httpPort);

console.log('Listening on port ' + httpPort);
