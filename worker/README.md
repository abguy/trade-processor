# Market Trade Processor Worker

Welcome to the Market Trade Processor Worker subproject!

This subproject is a part of [Market Trade Processor project](https://github.com/abguy/trade-processor).

# Why PHP?

Perhaps it is not the best solution but it is good enough for [our purpose](https://github.com/abguy/trade-processor). 
Modern PHP has an amazing number of different frameworks, libraries, components and so on.
PHP programs also could be easily covered by tests.

I've implemented the worker with validation, colorized console output, with ability to configure output verbosity level, etc.
The result program is able to process **30k messages for less than a minute**.  It needs  **~7 Mb of memory** for execution.      
Thus the result is good enough, I think. 

## Some other notes

I have had a desire to learn coroutines which became available in the last PHP versions. 
Despite the fact that there were no evident needs to use coroutines for this project I used an opportunity to learn them in my application.

Thus, the worker has an ability to process multiple csv files simultaneously via "cooperative multitasking".
It means that messages are aggregated in "parallel" processes.

All invalid messages are filtered. It means that messages with wrong dates, currencies or countries are ignored by workers.
Unfortunately violation messages are not logged. It is quite possible that nobody reads these logs.

# How to setup

Download sources, then:

    curl -s https://getcomposer.org/installer | php --
    php composer.phar install --no-dev

Alternately, you could update all components and install development dependencies:

    curl -s https://getcomposer.org/installer | php --
    php composer.phar update

# How to start

Check `config/config.yml`, copy required certificates. That's all, you are ready to start it.

    php worker.php
    
or in order to have some output: 

    php worker.php -v
    php worker.php -vv
    php worker.php -vvv

## How to use in production

You should use a tool for monitoring of workers. For example, you can use [forever CLI tool](https://github.com/foreverjs/forever) or [PM2](https://github.com/Unitech/PM2).
I prefer PM2.

    sudo yum install npm
    sudo npm install pm2@latest -g
    for i in {1..2}; do pm2 start --interpreter=php -n worker$i -f -e logs/err$i.log -o logs/out$i.log worker.php -- -v --no-ansi; done
    sudo pm2 startup centos

This command starts 2 worker processes, passes " -v" verbosity level to the worker application and disables it's ANSI output.
Please use the number of processes depending on available CPUs (cluster mode).

### Monitoring
Once apps are started you can list and manage all running processes easily:

```bash
pm2 list
```

![Process listing](https://raw.githubusercontent.com/unitech/pm2/master/pres/pm2-list.png)

Monitoring all processes launched:

```bash
pm2 monit
```

![Monit](https://raw.githubusercontent.com/unitech/pm2/master/pres/pm2-monit.png)


# Advanced usage

You can provide messages in CSV files instead of RabbitMQ queue. Just provide the list of files in arguments.

    php worker.php messages.csv
    php worker.php messages.csv messages2.csv
    php worker.php messages.csv messages2.csv messages3.csv

Disable ANSI output:

    php worker.php --no-ansi messages.csv

List of additional options:

    php worker.php help worker:run

List of supported commands:

    php worker.php list
    php worker.php help

##Verbosity

You could specify additional levels of verbosity:

    php worker.php -v messages.csv
    php worker.php -vv messages.csv
    php worker.php -vvv messages.csv

#How to test

Before executing of unit tests please install development dependencies as it was described [above](#how-to-setup).
After that you could run tests by the following command:

    vendor/bin/phpunit

