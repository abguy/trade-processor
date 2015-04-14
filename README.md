# Market Trade Processor

Welcome to the Market Trade Processor project!

It is a test project where we are going to build distributed system which is able to process a huge number of messages in real time.

# Achievements

Each consumer node is able to receive up to **4,2k messages per a second** in average. The overall processing time is about 1.5 minutes for 100k messages.

A single consumer server can handle **360k concurent connections**. *Actually I have reached my limits of 20 AWS EC2 instances and was not able to create more requests.*

You can find more additional details in the [tests subproject](tests).

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

## Subsystems

* [Frontend](frontend), [Frontend demo](http://abelyaev.net/)
* [Storage RESTful endpoint](storage)
* [Consumer endpoint](consumer)
* [Worker](worker)
* [Tests](tests)

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
* soft nofile 1048000
* hard nofile 1048000
~~~

4. Apply settings

```bash
sysctl -p
```

## Security notes

1. Redis is designed to be accessed by trusted clients inside trusted environments ([proof](http://redis.io/topics/security)). This means that usually it is not a good idea to expose the Redis instance directly to the internet. Thats why "Storage subsystem" should be inside the private network, e.g. like [Amazon Virtual Private Cloud](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Introduction.html).

2. Unfortunately I have no valid (not self signed) SSL certificates. Thats why the "Message Consumption" entry point is not secured as well as the "Frontend UI" entry point.

3. All other interactions between components have to be secured with SSL.

# Contacts

If you have questions you could reach me at A.V.Belyaev at gmail.

Hope you have a fantastic day!