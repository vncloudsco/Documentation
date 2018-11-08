---
layout: post
title: "Cài đặt Freezer Nâng Cao"
tags: Freezer
description: Freezer Agent bao gồm hai thành phần Freezer Agent và Freezer Scheduler 
comments: true
author: VNC
---

# Cài đặt Freezer Agent
## Chuẩn  bị cài đặt
- Freezer Agent bao gồm hai thành phần: Freezer Agent và Freezer Scheduler
- Cài đặt Freezer Agent từ source
- Chọn phiên bản Freezer Agent phù hợp với OpenStack vesion
- Freezer Scheduler stable/Liberty và stable/Kilo chỉ làm việc với Keystone API v2.0

##Yêu cầu 
Freezer Agent yêu cầu các gói cài đặt sau:

- python
- pthon-dev
- GNU Tar >= 1.26
- gzip, bzip2, xz
- OpenSSL
- python-swiftclient
- python-keystoneclient
- pymongo
- PyMySQL
- libmysqlclient-dev
- sync

## Cài đặt trên Ubuntu
- Cài đặt các gói phụ thuộc

```
apt-get install -y python-dev python-pip git openssl gcc  make automake libssl-dev python-git build-essential libffi-dev
```

- Clone phiên bản Freezer Client với git

```
git clone -b [branch] https://github.com/openstack/freezer.git
```
- Tiến hành cài đặt các gói phụ thuộc với pip

```
cd freezer/
```

```
sudo pip install -r requirements.txt
```
- Cài đặt freezer từ source

```
sudo python setup.py install
```

- Cài đặt các module cần thiết

```
pip install tzlocal futures funcsigs debtcollector babel netaddr rfc3986  python-dateutil oslo.context oslo.serialization iso8601 monotonic keystoneauth1 pyparsing prettytable netifaces cryptography
```

- Kiểm tra trạng thái freezer-agent và freezer-scheduler

```
freezer-scheduler status
freezer-agent -h
```
### Cài Đặt Freezr-api
#### A.Môi trường cài đặt
 - OS: Ubuntu 14.04.5 LTS 
 - Kernel: 3.16.0-77-generic
 - Platform: OpenStack Mitaka

#### B. Cài đặt
##### 1. Cài đặt Freezer (thực hiện trên node Freezer)
##### 1.1. Cài đặt git
```
apt-get install git -y
apt-get install python-pip -y
```
###### 1.2. Cài đặt các thư viện cần thiết
```
pip install wrapt
pip install markupsafe
```
###### 1.3. Cài đặt freezer-api
```
git clone https://git.openstack.org/openstack/freezer-api.git
cd freezer-api
git checkout master
pip install ./
```

###### 1.4. Copy file cấu hình vào thư mục `/etc/freezer`
```
cp etc/freezer/freezer-api.conf.sample /etc/freezer/freezer-api.conf
cp etc/freezer/freezer-paste.ini /etc/freezer/freezer-paste.ini
cp etc/freezer/policy.json /etc/freezer/policy.json
```

###### 1.5. Chỉnh sửa file cấu hình
Cấu hình cho keystone và elastic search
```
vim /etc/freezer/freezer-api.conf

...
[keystone_authtoken]
auth_uri=http://10.10.10.157:5000/v3 
identity_uri=http://10.10.10.157:35357	
auth_version = v3 
admin_tenant_name = service
admin_user = freezer
admin_password = Welcome123

[storage]
hosts='http://localhost:9200' #khai báo IP của node ElasticSearch
number_of_replicas=0 #Số bản sao của DB.

```

### 1.6. Tạo service quản lý bởi init cho freezer-api
```
vim /etc/init/freezer-api.conf


description "Freezer AIP Service"

# Service level
start on runlevel [2345]

# When to stop the service
stop on runlevel [016]

# Automatically restart process if crashed
respawn


# Specify working directory
chdir /usr/local/bin/

# Specify the process/command to start, e.g.
exec freezer-api

```

##### 2. Cài đặt ElasticSearch, thực hiện trên Freezer node, (có thể tách ra node riêng)
###### 2.1. Thêm Java PPA vào apt
```
add-apt-repository -y ppa:webupd8team/java
apt-get update
```

###### 2.2. Cài đặt Java 8
```
apt-get -y install oracle-java8-installer
```
###### 2.3. Import ElasticSearch public GPG key vào apt
```
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
```

###### 2.4. Tạo ElasticSearch source list
```
echo "deb http://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
apt-get update
```

###### 2.5. Cài đặt ElasticSearch
```
apt-get -y install elasticsearch
```

###### 2.6. Chỉnh sửa file cấu hình
```
vim /etc/elasticsearch/elasticsearch.yml

network.host: localhost #Có thể sửa thành 0.0.0.0 nếu muốn tất cả các Server ngoài truy cập vào
```

###### 2.7. Khởi động lại ElasticSearch
```
service elasticsearch restart
```

#### 3. Cấu hình Keystone (thực hiện trên node Keystone)
###### 3.1. Tạo Keystone endpoint v2.0
```
openstack endpoint create --region RegionOne identity public http://10.10.10.157:5000/v2.0

openstack endpoint create --region RegionOne identity internal http://10.10.10.157:5000/v2.0

openstack endpoint create --region RegionOne identity admin http://10.10.10.157:35357/v2.0
```

###### 3.2. Tạo user, service và endpoint cho Freezer
```
openstack user create freezer --domain default --password Welcome123
openstack role add --project service --user freezer admin
openstack service create --name freezer --description "Freezer Backup Service" backup
openstack endpoint create --region RegionOne backup public  http://10.10.10.160:9090 #IP của node Freezer
openstack endpoint create --region RegionOne backup admin http://10.10.10.160:9090 #IP của node Freezer
openstack endpoint create --region RegionOne backup internal http://10.10.10.160:9090 #IP của node Freezer
```

###### 3.3. Tạo DB cho freezer
```
freezer-manage db sync
```

###### 3.4. Khởi động lại freezer-api
```
service freezer-api restart
```

###### 3.5 Test freezer-api
```
curl -H 'X-Auth-Token: [Token]' localhost:9090/v1
```

### Cài Đặt Freezer Web Ui
#### A.Môi trường cài đặt
 - OS: Ubuntu 14.04.5 LTS 
 - Kernel: 3.16.0-77-generic
 - Platform: OpenStack Mitaka

#### B. Cài đặt
##### 1. Tải source code của freezer-web-ui, sử dụng bản master
```
git clone https://github.com/openstack/freezer-web-ui.git
cd freezer-web-ui
git checkout stable/mitaka
```

##### 2. Lỗi không hiển thị các bản backup
###### 2.1. Sửa file `/root/freezer-web-ui/disaster_recovery/backups/views.py`

```
class IndexView(tables.DataTableView):
    name = _("Backups")
    slug = "backups"
    table_class = freezer_tables.BackupsTable
    template_name = "disaster_recovery/backups/index.html"

    @shield('Unable to retrieve backups.', redirect='backups:index')
    def get_data(self):
        filters = self.table.get_filter_string() or {}
        return freezer_api.Backup(self.request).list(search=filters)
```



###### 2.2. Sửa file `/root/freezer-web-ui/disaster_recovery/api/api.py`

```
class Backup(object):

    def __init__(self, request):
        self.request = request
        self.client = client(request)

    def list(self, json=False, limit=500, offset=0, search=None):
        if search:
            search = {"match": [{"_all": search}, ], }

        backups = self.client.backups.list_all(limit=limit,
                                           offset=offset,
                                           search=search)

```

##### 3. Tiến hành cài đặt freezer-web-ui
```
python setup.py install
cp freezer-web-ui/disaster_recovery/enabled/_5050_freezer.py  /usr/share/openstack-dashboard/openstack_dashboard/enabled/_5050_freezer.py
```

##### 4. Lỗi không load được freezer UI 
###### 4.1. Sửa file `/usr/share/openstack-dashboard/openstack_dashboard/local/local_settings.py`, thêm
```
FREEZER_API_URL = 'http://10.10.10.160:9090' #IP của node Freezer-api
```

###### 4.2. Sửa file `/usr/share/openstack-dashboard/static/freezer/js/freezer.actions.action.js`, bổ xung vào cuổi 
```
$(function () {
    hideEverything();
    setActionOptions();
    setStorageOptions();
    setModeOptions();
});
```

##### 5. Khởi động lại apache2 và memcached
```
service apache2 restart
service memcache restart
```

##### 6. Giao diện quản lý của Freezer trên Dashboard
![](http://image.prntscr.com/image/0df9e3d29892491e86830c5e9192c9d8.png)
  
