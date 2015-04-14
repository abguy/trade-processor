# Market Trade Processor Tests

Welcome to the Market Trade Processor Tests subproject!

This subproject is a part of [Market Trade Processor project](https://github.com/abguy/trade-processor).

# General idea

How to test the system properly? If your server is able to process thousand requests per a second it is not an easy task.

## Simple way

I've prepared a little script for testing with ab. You can find it in `scripts` directory.

```bash
scripts/exec.sh
scripts/exec.sh --force
```    

**Note:** Make sure that you apply your parameters at the begining of `scripts/exec.sh`.

## Advanced way

[Apache Benchmark](httpd.apache.org/docs/2.2/programs/ab.html) is a very good tool, but it is limited to not more than 20k concurent connections. [Proof](http://mail-archives.apache.org/mod_mbox/httpd-dev/200403.mbox/%3Cs0582f22.041@prv-mail20.provo.novell.com%3E)

On the other hand ab is good enough. It is hard to imagine a better performance on a single server. Linux limits number of open sockets to 1024 by default, ab is able to open 20k concurent connections (of course after special tuning of your Linux machine).

Perhaps some other tools like [JMeter](http://jmeter.apache.org/), [Siege](http://www.joedog.org/siege-home/), [Tsung](http://tsung.erlang-projects.org/user_manual/index.html) or [Yandex tank](https://github.com/yandex/yandex-tank) are better choice, but I've decided to use multiserver installation of Apache Benchmark. AB just does some very basic measurements and we don't need to build complex scenarios with extended reports. Thus it is good enough.

How to distribute our installation of AB? [Bees with Machine Guns!](https://github.com/newsapps/beeswithmachineguns) is the answer. It is is *“An utility for arming (creating) many bees (micro EC2 instances) to attack (load test) targets (web applications)”*. In other words it simulates traffic originating from several different sources to hit the target. Each source is a “bee” which is an EC2 micro instance, which will load test the target using Apache’s ab.

# Configuration

In order to make our system really distributed I've setup test servers in different data centers. Moreover, I made them at different hosting providers.

There were **no any load balancers** were used in my installation.

## Frontend server

* 2 CPU cures, 750 Mb RAM.
* Provider: [Rusonyx](http://www.rusonyx.ru/)

* [Frontend UI](https://github.com/abguy/trade-processor/blob/master/frontend)
* Redis
* [Storage RESTful endpoint](https://github.com/abguy/trade-processor/blob/master/storage)

## RabbitMQ server

[Standard_D3](http://azure.microsoft.com/en-us/pricing/details/virtual-machines/): 4 CPU cures, 14 Gb RAM
Provider: [Microsoft Azure](http://azure.microsoft.com/)

## Consumer server

* [The cheapest "high volume plan"](https://www.digitalocean.com/pricing/): 8 CPU cures, 16 Gb RAM
* Provider: [Digital ocean](https://www.digitalocean.com/)

* [Consumer endpoint](https://github.com/abguy/trade-processor/blob/master/consumer)

## Worker servers

There were 2 servers deployed:

* [n1-highcpu-8](https://cloud.google.com/pricing/): 8 CPU cures, 7.2 Gb RAM
* Provider: [Google Cloud Platform](https://cloud.google.com/)
10 [worker](https://github.com/abguy/trade-processor/blob/master/worker) processes.

* [n1-highcpu-2](https://cloud.google.com/pricing/): 2 CPU cures, 1.8 Gb RAM
* Provider: [Google Cloud Platform](https://cloud.google.com/)
4 [worker](https://github.com/abguy/trade-processor/blob/master/worker) processes.


## Test servers

18 AWS micto instances were used to emulate 360k concurrent requests.

* [t2.micro](http://aws.amazon.com/ec2/pricing/): 1 CPU cure, 1 Gb RAM
* Provider: [Amazon Web Services](http://aws.amazon.com/)

* [Tests](https://github.com/abguy/trade-processor/blob/master/tests)
