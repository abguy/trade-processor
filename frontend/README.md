# Market Trade Processor Frontend

Welcome to the Market Trade Processor Frontend subproject!

This subproject is a part of [Market Trade Processor project](https://github.com/abguy/trade-processor).

# How to setup

Before start of the application please check "config/config.json", then execute:

    npm install
    npm run setup
    npm start

## Some Notes

* You shouldn't use Node.js server directly in production. Please use something like [Nginx](http://nginx.org/), [PM2](https://github.com/Unitech/pm2) or [forever project](https://github.com/foreverjs/forever) before lunch.

* Flow graph doesn't work in IE properly as well as the source libraries examples. Please check the code source for more details.

# How to test

Before test the application please check "config/config.json", then execute:

    npm test
