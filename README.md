# Market Trade Processor

Welcome to the Market Trade Processor project!

It is a test project where I am going to build a distributed system which is able to process a huge number of messages in real time.

## Subsystems

* [Frontend](frontend), [Frontend demo](http://abelyaev.net/)
* [Storage RESTful endpoint](storage)
* [Consumer endpoint](consumer)
* [Worker](worker)
* [Tests](tests)

# Achievements

Each consumer node is able to receive up to **4,2k messages per a second** in average. The overall processing time is about 1.5 minutes for 100k messages (including aggregation and delivering to the frontend UI).

A single consumer server can handle **1 million concurent connections**. *Actually I am going to increase my limits of 50 AWS EC2 and try to create 10 millions(!) concurrent connections.*

You can find more additional details in the [tests subproject](tests#results).

# An idea behind

I am going to build a market trade processor which consumes trade messages via an endpoint, processes those messages in some way and delivers a frontend of processed information based on the consumed messages.

Trade messages will be POST’ed to a single endpoint and will take the JSON form of:

~~~
{
    "userId": "134256",
    "currencyFrom": "EUR",
    "currencyTo": "GBP",
    "amountSell": 1000,
    "amountBuy": 747.10,
    "rate": 0.7471,
    "timePlaced" : "24-JAN-15 10:27:44",
    "originatingCountry" : "FR"
}
~~~

The system has to process these messages and display results in UI with a realtime visualisation of messages being processed.

# Implementation details

## Overall architecture

![Market Trade Processor architecture](https://raw.githubusercontent.com/abguy/trade-processor/master/images/architecture.png)

## How to tune Linux server

Linux server limits the number of open files to 1024 by default. It means that you couldn't open more sockets or connections. You could check it by `ulimit -a` command.

In order to increase these limits you may execute (e.g. for CentOS 7):

1. Execute:

    ```bash
    ulimit -n 1048000
    ulimit -S -n 1048000
    ```

2. Change `/etc/security/limits.conf` file

    ~~~
    * soft nofile 1048000
    * hard nofile 1048000
    ~~~

3. Change `/etc/sysctl.conf` file

    ~~~
    # General gigabit tuning:
    net.core.rmem_max = 16777216
    net.core.wmem_max = 16777216
    net.ipv4.tcp_rmem = 102496 174760 16777216
    net.ipv4.tcp_wmem = 102496 174760 16777216
    net.ipv4.tcp_moderate_rcvbuf=0
    net.ipv4.tcp_syncookies = 1
    net.ipv4.ip_local_port_range = 16384 65535

    # this gives the kernel more memory for tcp
    # which you need with many (100k+) open socket connections
    net.ipv4.tcp_mem = 1572864 1835008 2303190
    net.core.netdev_max_backlog = 2500
    net.ipv4.tcp_max_syn_backlog=524288 
    net.ipv4.tcp_max_orphans=262144  
    net.ipv4.tcp_max_tw_buckets = 65536
    net.ipv4.tcp_tw_recycle = 1
    net.ipv4.tcp_tw_reuse = 0
    net.ipv4.tcp_syn_retries = 3
    net.ipv4.tcp_synack_retries = 3
    net.ipv4.tcp_retries1 = 3
    net.ipv4.tcp_retries2 = 8
    net.ipv4.tcp_fin_timeout = 10
    net.ipv4.tcp_low_latency = 1

    fs.file-max = 1048000
    ~~~

4. Apply settings

    ```bash
    sysctl -p
    ```

## Security notes

1. Redis is designed to be accessed by trusted clients inside trusted environments ([proof](http://redis.io/topics/security)). This means that usually it is not a good idea to expose the Redis instance directly to the internet. Thats why "Storage subsystem" should be inside the private network, e.g. like [Amazon Virtual Private Cloud](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Introduction.html).

2. Unfortunately I have no valid (not self signed) SSL certificates. Thats why the "Message Consumption" entry point is not secured as well as the "Frontend UI" entry point.

3. All other interactions between components have to be secured with SSL.

## Other notes

1. I think that the system should use [HTTP2](http://en.wikipedia.org/wiki/HTTP/2) for better performance, but there are too few clients support it yet.

2. You should use something like [HAProxy](http://www.haproxy.org/) before consumer nodes for production. Your system has to be robustness in case of hardware failures.

3. A production ready system must have a failure detector in order to restore functionality quickly.

4. My installation is configured with 1 minute delays before messages will be delivered to the frontend UI. This value could be changed easily depending from the expected loading. Moreover this value could be changed dinamically.

# Contacts

If you have questions you could reach me at A.V.Belyaev at gmail.

Hope you have a fantastic day!