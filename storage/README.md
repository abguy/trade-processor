# Market Trade Processor Storage

Welcome to the Market Trade Processor Storage subproject!

This subproject is a part of [Market Trade Processor project](https://github.com/abguy/trade-processor).

# How to setup

**Note**. The instruction below is suitable for CentOS only. Please check [Nginx](http://nginx.org/) and [PM2](https://github.com/Unitech/pm2) documentation for installation to other OSes.

Before start of the application please check "config/config.json", then execute:

    sudo npm install pm2 -g
    sudo npm install
    pm2 start storage-api.js
    sudo pm2 startup centos

Then configure [Nginx](http://nginx.org/) server.

    sudo cp -f nginx_conf/storage.conf /etc/nginx/sites-available/
    sudo cp -R nginx_conf/certificates /etc/nginx/
    sudo service nginx restart

**Note**. You should upload to a server the following certificates only (!):

* storage-server.crt
* storage-server.nopass.key
* storage-client-ca.crt

## How to prepare server SSL certificates

    openssl req -new -newkey rsa:2048 -nodes -keyout storage-server-ca.key -x509 -days 3652 -subj "/C=RU/ST=Novosibirsk/L=Novosibirsk/O=Alexey Belyaev/OU=Storage/CN=abelyaev.net/emailAddress=admin@abelyaev.net" -out storage-server-ca.crt

    openssl genrsa -des3 -out storage-server.key 2048
    openssl req -new -key storage-server.key -subj "/C=RU/ST=Novosibirsk/L=Novosibirsk/O=Alexey Belyaev/OU=Storage server/CN=abelyaev.net/emailAddress=admin@abelyaev.net" -out storage-server.csr
    openssl x509 -req -days 365 -in storage-server.csr -CA storage-server-ca.crt -CAkey storage-server-ca.key -set_serial 01 -out storage-server.crt
    openssl rsa -in storage-server.key -out storage-server.nopass.key

    openssl verify -CAfile storage-server-ca.crt storage-server.crt

## How to prepare client SSL certificates

Create `ca.config` file with the following content:

~~~
[ ca ]
default_ca = CA_CLIENT

[ CA_CLIENT ]
dir = ./db
certs = $dir/certs
new_certs_dir = $dir/newcerts

database = $dir/index.txt
serial = $dir/serial
certificate = ./storage-client-ca.crt
private_key = ./storage-client-ca.key

default_days = 365
default_crl_days = 7
default_md = sha1

policy = policy_anything

[ policy_anything ]
countryName = supplied
stateOrProvinceName = supplied
localityName = supplied
organizationName = supplied
organizationalUnitName = supplied
commonName = supplied
emailAddress = supplied
~~~

Then execute:

    mkdir db
    mkdir db/certs
    mkdir db/newcerts
    touch db/index.txt
    echo "01" > db/serial
    echo "unique_subject = no" > db/index.txt.attr

    openssl req -new -newkey rsa:4096 -keyout storage-client-ca.key -x509 -days 3652 -subj "/C=RU/ST=Novosibirsk/L=Novosibirsk/O=Alexey Belyaev/OU=Storage CA/CN=abelyaev.net/emailAddress=admin@abelyaev.net" -out storage-client-ca.crt

    openssl req -new -newkey rsa:2048 -nodes -keyout storage-client-01.key -subj "/C=RU/ST=Novosibirsk/L=Novosibirsk/O=Alexey Belyaev/OU=Storage clients/CN=abelyaev.net/emailAddress=admin@abelyaev.net" -out storage-client-01.csr
    openssl ca -config ca.config -in storage-client-01.csr -out storage-client-01.crt -batch
    openssl verify -CAfile storage-client-ca.crt storage-client-01.crt

    openssl req -new -newkey rsa:2048 -nodes -keyout storage-client-02.key -subj "/C=RU/ST=Novosibirsk/L=Novosibirsk/O=Alexey Belyaev/OU=Storage clients/CN=abelyaev.net/emailAddress=admin@abelyaev.net" -out storage-client-02.csr
    openssl ca -config ca.config -in storage-client-02.csr -out storage-client-02.crt -batch
    openssl verify -CAfile storage-client-ca.crt storage-client-02.crt

## How to check SSL connection

    curl -i --tlsv1.2 --cert ./storage-client-01.crt --key ./storage-client-01.key 'https://abelyaev.net:9443/' --cacert storage-server-ca.crt -X POST --data '{}' -H 'Content-Type: application/json; charset=UTF-8'
    curl -i --tlsv1.2 --cert ./storage-client-02.crt --key ./storage-client-02.key 'https://abelyaev.net:9443/' --cacert storage-server-ca.crt -X POST --data '{}' -H 'Content-Type: application/json; charset=UTF-8'

If your server is configured properly you should see something like

~~~
HTTP/1.1 204 No Content
Server: nginx
Date: Wed, 01 Apr 2015 12:08:20 GMT
Connection: keep-alive

~~~

# How to test

I didn't prepare scripts for storage automatic testing. Although you can use my bash script form `scripts` directory for manual testing.

    scripts/exec.sh
    scripts/exec.sh --force

# Clear storage data

In order to remove all data from the storage:

    npm run reset
