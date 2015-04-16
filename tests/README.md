# Market Trade Processor Tests

Welcome to the Market Trade Processor Tests subproject!

This subproject is a part of [Market Trade Processor project](https://github.com/abguy/trade-processor).

# Configuration

How to test the system properly? If your server is able to process thousand requests per a second it is not an easy task.

In order to make our system really distributed I've setup test servers in different data centers. Moreover, I made them at different hosting providers. It is just for test. If you want to have the best performance you should use servers from a single datacenter definetly.

There were **no any load balancers** were used in my installation.

## Frontend server

Configuration
* 2 CPU cores, 750 Mb RAM.
* Provider: [Rusonyx](http://www.rusonyx.ru/)

Software
* CentOS 6.5
* [Frontend UI](https://github.com/abguy/trade-processor/blob/master/frontend)
* Redis
* [Storage RESTful endpoint](https://github.com/abguy/trade-processor/blob/master/storage)

## RabbitMQ server

Configuration
[Standard_D3](http://azure.microsoft.com/en-us/pricing/details/virtual-machines/): 4 CPU cores, 14 Gb RAM
Provider: [Microsoft Azure](http://azure.microsoft.com/)

Software
* CentOS 7 x64
* [RabbitMQ 3.5.1](https://www.rabbitmq.com/)
* [RabbitMQ configuration](https://github.com/abguy/trade-processor/tree/master/consumer#how-to-configure-rabbitmq-server)

## Consumer server

Configuration
* [The cheapest "high volume plan"](https://www.digitalocean.com/pricing/): 8 CPU cores, 16 Gb RAM
* Provider: [Digital ocean](https://www.digitalocean.com/)

Software
* CentOS 7 x64
* [Consumer endpoint](https://github.com/abguy/trade-processor/blob/master/consumer)

## Worker servers

There were 2 servers deployed:

First server
* [n1-highcpu-8](https://cloud.google.com/pricing/): 8 CPU cores, 7.2 Gb RAM
* Provider: [Google Cloud Platform](https://cloud.google.com/)
* CentOS 7 x64
* 10 [worker](https://github.com/abguy/trade-processor/blob/master/worker) processes.

Second server
* [n1-highcpu-2](https://cloud.google.com/pricing/): 2 CPU cores, 1.8 Gb RAM
* Provider: [Google Cloud Platform](https://cloud.google.com/)
* CentOS 7 x64
* 4 [worker](https://github.com/abguy/trade-processor/blob/master/worker) processes.

# Tests

## Simple way

I've prepared a little script for testing with [Apache Benchmark](http://httpd.apache.org/docs/current/programs/ab.html). You can find it in `scripts` directory.

```bash
scripts/exec.sh
scripts/exec.sh --force
```    

**Note:** Make sure that you apply your parameters at the begining of `scripts/exec.sh`.

## Advanced way

[Apache Benchmark](http://httpd.apache.org/docs/current/programs/ab.html) is a very good tool, but it is limited to not more than 20k concurent connections. [proof](http://mail-archives.apache.org/mod_mbox/httpd-dev/200403.mbox/%3Cs0582f22.041@prv-mail20.provo.novell.com%3E)

On the other hand ab is good enough. It is hard to imagine a better performance on a single server. Linux limits number of open sockets to 1024 by default, ab is able to open 20k concurent connections (of course after [special tuning of your Linux machine](https://github.com/abguy/trade-processor#how-to-tune-linux-server)).

Perhaps some other tools like [JMeter](http://jmeter.apache.org/), [Siege](http://www.joedog.org/siege-home/), [Tsung](http://tsung.erlang-projects.org/user_manual/index.html) or [Yandex tank](https://github.com/yandex/yandex-tank) are better choice, but I've decided to use multiserver installation of Apache Benchmark. AB just does some very basic measurements and we don't need to build complex scenarios with extended reports. Thus it is good enough.

How to distribute our installation of AB? [Bees with Machine Guns](https://github.com/newsapps/beeswithmachineguns) is the answer. It is is *“An utility for arming (creating) many bees (micro EC2 instances) to attack (load test) targets (web applications)”*. In other words it simulates traffic originating from several different sources to hit the target. Each source is a “bee” which is an EC2 micro instance, which will load test the target using Apache’s ab.

## Note

ab often has a lot of failed connections if you use it from other datacenters. On the other hand I have never seen ab errors when I execute it in a local network with a consumer server. I think that it is because of network troubles.

# Results

## 100k requests with 20k concurrency

Total time: **23.5 seconds**; Requests per second: **4,247**.

**Note**. I've realized that the results depends on the server location significantly. This test was made from the [Digital ocean](https://www.digitalocean.com/) server.

**Note 2**. Make sure that your servers are able to open the necessary number of connections. Please check [How to tune Linux server section](https://github.com/abguy/trade-processor#how-to-tune-linux-server) for details.

Test node configuration
* [The cheapest plan](https://www.digitalocean.com/pricing/): 1 CPU core, 512 Mb RAM
* Provider: [Digital ocean](https://www.digitalocean.com/)

Software
* CentOS 7 x64
* [Apache Benchmark](http://httpd.apache.org/docs/current/programs/ab.html)

![100k](https://raw.githubusercontent.com/abguy/trade-processor/master/images/100k.png)

## 2,000k requests with 360k concurrency

Total time: **25 minutes 4 seconds**; Requests per second: **1329**.

### Hive configuration

18 AWS micto instances were used to emulate 360k concurrent requests. *Each of 18 bees will fire 111111 rounds, 20000 at a time.*

Test node configuration
* [t2.micro](http://aws.amazon.com/ec2/pricing/): 1 CPU core, 1 Gb RAM
* Provider: [Amazon Web Services](http://aws.amazon.com/)

Software
* CentOS 7 x64
* [Apache Benchmark](http://httpd.apache.org/docs/current/programs/ab.html)

### Consumer server

![consumer-top](https://raw.githubusercontent.com/abguy/trade-processor/master/images/consumer-top.png)

![consumer-ss](https://raw.githubusercontent.com/abguy/trade-processor/master/images/consumer-ss.png)

### RabbitMQ server

![rabbit-top](https://raw.githubusercontent.com/abguy/trade-processor/master/images/rabbit-top.png)

![rabbit-ss](https://raw.githubusercontent.com/abguy/trade-processor/master/images/rabbit-ss.png)

### Frontend UI server

![frontend-top](https://raw.githubusercontent.com/abguy/trade-processor/master/images/frontend-top.png)

## 2,000k requests with 1,000k concurrency

Total time: **51 minutes 49 seconds**; Requests per second: **643**. *Each of 50 bees will fire 40000 rounds, 20000 at a time.*

### Hive configuration

50 AWS micto instances were used to emulate 1 million concurrent requests.

Test node configuration
* [t2.micro](http://aws.amazon.com/ec2/pricing/): 1 CPU core, 1 Gb RAM
* Provider: [Amazon Web Services](http://aws.amazon.com/)

Software
* CentOS 7 x64
* [Apache Benchmark](http://httpd.apache.org/docs/current/programs/ab.html)

### Consumer server

![consumer-top](https://raw.githubusercontent.com/abguy/trade-processor/master/images/1m-consumer-top.png)

![consumer-ss](https://raw.githubusercontent.com/abguy/trade-processor/master/images/1m-consumer-ss.png)

### RabbitMQ server

![rabbit-top](https://raw.githubusercontent.com/abguy/trade-processor/master/images/1m-rabbit-top.png)

![rabbit-ss](https://raw.githubusercontent.com/abguy/trade-processor/master/images/1m-rabbit-ss.png)

### Frontend UI server

![frontend-top](https://raw.githubusercontent.com/abguy/trade-processor/master/images/1m-frontend.png)
