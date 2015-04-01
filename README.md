# Market Trade Processor

Welcome to the Market Trade Processor project!

It is my test project where we are going to build distributed system which is able to process a huge number of messages in real time.

# An idea behind

We want to build a market trade processor which consumes trade messages via an endpoint, processes those messages in some way and delivers a frontend of processed information based on the consumed messages. 

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

## Overal architecture

![Market Trade Processor architecture](http://abelyaev.net/img/trade-processor-architecture.png)

## Security notes

1. Redis is designed to be accessed by trusted clients inside trusted environments ([proof](http://redis.io/topics/security)). This means that usually it is not a good idea to expose the Redis instance directly to the internet. Thats why "Storage subsystem" should be inside the private network, e.g. like [Amazon Virtual Private Cloud](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Introduction.html).

2. Unfortunately I have no valid (not self signed) SSL certificates. Thats why the "Message Consumption" entry point is not secured as well as the "Frontend UI" entry point.

## Subsystems

* [Frontend](frontend)
