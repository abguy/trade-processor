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