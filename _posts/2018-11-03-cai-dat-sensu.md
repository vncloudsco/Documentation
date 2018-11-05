---
layout: post
title: "Cài đặt Làm Việc Với Sensu"
tags: Sensu
description: Cài đặt Làm Việc Với Sensu
comments: true
---
## Các bước cài đặt sensu
- Chạy lệnh dưới để update Ubuntu trên cả Server và Client

```sh
apt-get update -y && apt-get upgrade -y && apt-get dist-upgrade -y && init 6
```

### Cài đặt trên Server 

####  Install Erlang
```sh
sudo wget http://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb
sudo dpkg -i erlang-solutions_1.0_all.deb
sudo apt-get -y update
sudo apt-get -y install erlang-nox=1:18.2
```


#### Cài đặt RABBITMQ

- Cài đặt RABBITMQ
```sh
sudo wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.6.0/rabbitmq-server_3.6.0-1_all.deb
sudo dpkg -i rabbitmq-server_3.6.0-1_all.deb

curl -L -o ~/rabbitmq-signing-key-public.asc http://www.rabbitmq.com/rabbitmq-signing-key-public.asc

sudo apt-key add ~/rabbitmq-signing-key-public.asc

```

- Khởi động RABBITMQ
```sh
sudo update-rc.d rabbitmq-server defaults
sudo /etc/init.d/rabbitmq-server start
```

- Cấu hình SSL
```sh
wget http://sensuapp.org/docs/0.21/files/sensu_ssl_tool.tar
tar -xvf sensu_ssl_tool.tar

cd sensu_ssl_tool/

./ssl_certs.sh generate

mkdir -p /etc/rabbitmq/ssl && cp /root/sensu_ssl_tool/sensu_ca/cacert.pem /root/sensu_ssl_tool/server/cert.pem /root/sensu_ssl_tool/server/key.pem /etc/rabbitmq/ssl
```

- Sửa file `vi /etc/rabbitmq/rabbitmq.config` với nội dung dưới đây
```sh
[
    {rabbit, [
    {ssl_listeners, [5671]},
    {ssl_options, [{cacertfile,"/etc/rabbitmq/ssl/cacert.pem"},
                   {certfile,"/etc/rabbitmq/ssl/cert.pem"},
                   {keyfile,"/etc/rabbitmq/ssl/key.pem"},
                   {verify,verify_peer},
                   {fail_if_no_peer_cert,true}]}
  ]}
].
```

- Khởi động lại RABBITMQ
```
service rabbitmq-server restart
```


- Cấu hình cho RABBITMQ
```sh
rabbitmqctl add_vhost /sensu
rabbitmqctl add_user sensu secret
rabbitmqctl set_permissions -p /sensu sensu ".*" ".*" ".*"
```

### Cài đặt REDDIS
- Cài đặt REDDIS
```sh
sudo apt-get -y install redis-server
```

- Khởi động REDDIS cùng OS
```sh
update-rc.d redis-server defaults
/etc/init.d/redis-server start
```

#### Cài đặt SENSU

- Khai báo repos cho SENSU
```sh
wget -q http://repositories.sensuapp.org/apt/pubkey.gpg -O- | sudo apt-key add -
echo "deb     http://repositories.sensuapp.org/apt sensu main" | sudo tee /etc/apt/sources.list.d/sensu.list
```

- Thực hiện cài SENSU sau khi khai báo repos
```sh
apt-get -y update
apt-get -y install sensu
```

- Cấu hình SSL cho SENSU
```
sudo mkdir -p /etc/sensu/ssl && cp /root/sensu_ssl_tool/sensu_ca/cacert.pem /root/sensu_ssl_tool/server/cert.pem /root/sensu_ssl_tool/server/key.pem /etc/sensu/ssl
```

 Cài đặt uchiwa làm dashboard cho SENSU
```sh
apt-get install -y uchiwa
```


### Cấu hình cho SENSU

- Tạo file `vi /etc/sensu/conf.d/rabbitmq.json` với nội dung sau
```sh 
{
  "rabbitmq": {
    "ssl": {
      "cert_chain_file": "/etc/sensu/ssl/cert.pem",
      "private_key_file": "/etc/sensu/ssl/key.pem"
    },
    "host": "localhost",
    "port": 5671,
    "vhost": "/sensu",
    "user": "sensu",
    "password": "pass"
  }
}

```

- Tạo file  `vi /etc/sensu/conf.d/redis.json` với nội dung sau.
```sh
{
  "redis": {
    "host": "localhost",
    "port": 6379
  }
}
```

- Tạo file `vi /etc/sensu/conf.d/api.json` với nội dung sau.
```sh
{
  "api": {
    "host": "localhost",
    "port": 4567
  }
}
```

- Sao lưu fie ` /etc/sensu/uchiwa.json` mặc định
```sh
cp /etc/sensu/uchiwa.json /etc/sensu/uchiwa.json.bak
```



- Tạo file mới `vi /etc/sensu/uchiwa.json` với nội dung sau.
```sh
{
    "sensu": [
        {
            "name": "Sensu",
            "host": "localhost",
            "ssl": false,
            "port": 4567,
            "path": "",
            "timeout": 5000
        }
    ],
    "uchiwa": {
        "port": 3000,
        "stats": 10,
        "refresh": 10000
    }
}
```

- Tạo file ` vi /etc/sensu/conf.d/client.json` với nội dung sau.
```sh
{
  "client": {
    "name": "server",
    "address": "localhost",
    "subscriptions": [ "ALL" ]
  }
}
```

- Kích hoạt các dịch vụ khởi động cùng OS
```sh
sudo update-rc.d sensu-server defaults
sudo update-rc.d sensu-client defaults
sudo update-rc.d sensu-api defaults
sudo update-rc.d uchiwa defaults
```

- Khởi động lại các dịch vụ.
```sh
sudo service sensu-server start
sudo service sensu-client start
sudo service sensu-api start
sudo service uchiwa start
```

- Truy cập vào Dashboard với địa chỉ `http://ip-address:3000`

#### Cấu hình Sensu client trên server 

- Lúc này coi máy cài Sensu Server là một client.

