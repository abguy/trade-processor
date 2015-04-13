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

// Increase the number of available sockets
http.globalAgent.maxSockets = Infinity;
var posix = require('posix');
posix.setrlimit('nofile', { soft: 1048000 });

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
        createRabbitChannel()
    );
}

function createRabbitChannel() {
    return amqplib.connect(
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
            }, function(error) {
                debug('RabbitMQ queue erorr: %s', error);
                process.exit(1);
            });
        }, function(error) {
            debug('RabbitMQ channel erorr: %s', error);
            process.exit(1);
        });
    }, function(error) {
        debug('RabbitMQ connection error: %s', error);
        process.exit(1);
    });
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

process.on('uncaughtException', function (error) {
    debug('Uncaught exception: %s', error);
    console.log(error.stack);
    process.exit(1);
}); 

// Workers can share any TCP connection
// In our case its a HTTP server
var httpPort = parseInt(config.port, 10);
var server = http.createServer(function (request, response) {
    request.on('error', function(error) {
        debug('Problem with request: %s', error);
    });
    response.on('error', function(error) {
        debug('Problem with response: %s', error);
    });

    request.on('socket', function (socket) {
        // disable connection timeout
        socket.setTimeout(0);
        // disable Nagle algorithm
        socket.setNoDelay(true);

        socket.on('timeout', function (exception, socket) {
            debug('Socket timeout: %s', exception);
        });
    });

    
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
            if (null === body) {
                return;
            }
            currentChannelNumber = (currentChannelNumber + 1) % config.rabbitConnectionsPerWorker;
            var channelPromise = rabbitChannels[currentChannelNumber];
            channelPromise.then(function(channel) {
                if (!channel) {
                    throw 'Channel does not exist';
                }
                channel.sendToQueue('messages', body, {
                    persistent: true // or deliveryMode: 2
                });
            }, function(error) {
                debug('RabbitMQ channel error: %s. Try to reconnect...', error);
                rabbitChannels[currentChannelNumber] = createRabbitChannel();
            });
        });
    }
    response.writeHead(204);
    response.end();
});
server.listen(httpPort);
console.log('Listening on port ' + httpPort);

server.on('clientError', function (exception, socket) {
    debug('Problem with client: %s', exception);
});