# Market Trade Processor Consumer

Welcome to the Market Trade Processor Consumer subproject!

This subproject is a part of [Market Trade Processor project](https://github.com/abguy/trade-processor).

# Why Node.js?

Consumer is built using Node.js v0.12.2. 

Perhaps Golang could show a better performance but I'd like to check [Node.js cluster](https://nodejs.org/api/cluster.html). 

# How to setup

**Note**. The instruction below is suitable for CentOS only. Please check pm2 documentation for installation to other OSes.

**Note 2**. Make sure that your servers are able to open the necessary number of connections. Please check [How to tune Linux server](https://github.com/abguy/trade-processor#how-to-tune-linux-server) section for details.

Before start of the application please:
* install Node.js >= v0.12.2;
* prepare RabbitMQ certificates
* check "config/config.json";
* in the project dir execute:

~~~
    sudo npm install pm2 -g
    sudo npm install
    pm2 start -e logs/err.log -o logs/out.log consumer.js
    sudo pm2 startup centos
~~~

## How to configure RabbitMQ server

The most of necessary information you could find in the [RabbitMQ documentation](http://www.rabbitmq.com/install-rpm.html).
There are some other tips below I used on my installation.

### RabbitMQ user permissions

    rabbitmqctl add_user consumer password
    rabbitmqctl delete_user guest
    rabbitmqctl add_vhost /consumer
    rabbitmqctl set_permissions -p /consumer consumer "^messages" ".*" ".*"

### RabbitMQ config

~~~
[
    {ssl, [{versions, ['tlsv1.2']}]},
    {rabbit, [
        {tcp_listeners, []},
        {log_levels, [{connection, none}]},
        {ssl_listeners, [5671]},
        {ssl_options, [{cacertfile,"/usr/local/rabbit/certs/cacert.pem"},
                    {certfile,"/usr/local/rabbit/server/cert.pem"},
                    {keyfile,"/usr/local/rabbit/server/key.pem"},
                    {password, "ServerSuperT0p$3kRe7Password"},
                    {depth, 2},
                    {verify,verify_peer},
                    {fail_if_no_peer_cert,true}]},
        {vm_memory_high_watermark, 0.9},
        {hipe_compile, true},
        {heartbeat, 60}
    ]}
].
~~~

### RabbitMQ SSL certificates

* [RabbitMQ documentation](http://www.rabbitmq.com/ssl.html);
* [amqplib library for Node.JS documentation](http://www.squaremobius.net/amqp.node/doc/ssl.html).
