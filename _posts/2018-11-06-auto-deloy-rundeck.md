---
layout: post
title: "Tự động triên khai Rundeck bằng Vagrant và Ansible"
tags: Vagrant
description: Rundeck là một phần mềm mã nguồn mở giúp bạn tự động hóa các các quy trình hoạt động thường xuyên tại datacenter
comments: true
author: VNC
---
# Tìm hiểu về Rundeck.

##1. Rundeck là gì?

- Rundeck là một phần mềm mã nguồn mở giúp bạn tự động hóa các các quy trình hoạt động thường xuyên tại datacenter hoặc 
môi trường điện toán đám mây. Rundeck cung cấp một số tính năng làm giảm bớt các công việc khó khăn và tốn nhiều thời gian 
và làm cho nó trở nên dễ dàng hơn cho bạn có thể cải thiện được các nỗ lực tự động hóa phục vụ chúng ta cũng như tạo ra các 
dịch vụ tự động dành cho người khác.

- Các đội có thể hợp tác chia sẻ các quy trình được tự động trong khi những người khác được trao niềm tin để xem hoạt động 
hoặc thực hiện các nhiệm vụ.

- Rundeck cho phép bạn chạy các nhiệm vụ trên bất kỳ số lượng node từ một giao diện dựa trên  web hoặc một command. Rundeck còn cung cấp 
thêm các tính năng khác giúp chúng ta có thể dễ dàng mở rộng quy mô tự động hóa bao gồm : Kiểm soát truy cập , xây dựng quy trình làm việc, 
lập kế hoawjch, thu thập log, và tích hợp các nguồn dữ liệu bên ngoài cho node và các dữ liệu được lựa chọn.

##2. Ai là người làm ra Rundeck ?

- Rundeck được phát triển trên GitHub là một dự án được gọi là [rundeck](https://github.com/rundeck/rundeck) bởi SimplifyOps và cộng đồng Rundeck. Tất cả người dùng mới được 
hoan nghênh tham gia vào dự án và đóng góp. Vui lòng bỏ phiếu ý tưởng tính năng trên [Trello Ban Rundeck](https://trello.com/b/sn3g9nOr/rundeck-development).

- Rundeck là phần mềm miễn phí và là công khai theo Giấy phép Apache Software.

##3. Các tính năng của Rundeck.
-  Web API
- Distributed command execution
- Pluggable execution system (SSH by default)
- Multi-step workflows
- Job execution with on demand or scheduled runs
- Graphical web console for command and job execution
- Role-based access control policy with support for LDAP/ActiveDirectory
- History and auditing logs
- Open integration to external host inventory tools
- Command line interface tools

##4. Rundeck architecture.

- Rundeck là một ứng dụng máy chủ bạn lưu trữ trên hệ thống bạn chỉ định một điểm kiểm soát trung tâm . Bên trong, bạn lưu trữ 
các công việc và lịch sử thực hiện trong một cơ sở dữ liệu quan hệ. Đầu ra từ các command và công việc được thực hiện và lưu 
trên đĩa , nhưng có thể được lưu trữ từ xa giống như S3 hay Logstash.

- Rundeck thực hiện phân phối các command được sử dụng bởi một Pluggable node execution layer mặc định là SSH. Tuy nhiên 
pluggin cho phép bạn có thể sử dụng các phương tiện khác như MCollective, Salt, WinRM, hoặc các phương pháp của bạn.  Cấu hình Rundeck 
bao gồm các thiaêt lập để xác định người sử dụng ra bên ngoài được cho phép bởi các máy chủ từ xa. Các máy chủ từ xa không cần thiết lập 
kết nối trở lại máy chủ.

![scr1](https://i.imgur.com/SUQkPUF.png)

- Các ứng dụng Rundeck chính là một webapp trên nền JAVA . Ứng dụng này cung cấp cả giao diện và mạng lưới gioa diện đồ họa được 
sử dụng bởi các Rundeck shell tools.

##5. Cài đặt Rundeck.

- Sau đây là cách cài đặt Rundeck trên Ubuntu server

- Đầu tiên chúng ta tiến hành cài đặt JDK 7 .

```sh
sudo apt-get update
sudo apt-get install openjdk-7-jre
```

- Chỉnh sửa file  `/etc/environment` :

```sh
vi /etc/environment
```

- Thêm dòng sau vào cuối file và lưu lại :

```sh
JAVA_HOME="/usr/lib/jvm/java-1.7.0-openjdk-amd64"
```

- Dowload file cài đặt Rundeck và tiến hành cài đặt.

```sh
wget http://dl.bintray.com/rundeck/rundeck-deb/rundeck-2.2.1-1-GA.deb
sudo dpkg -i rundeck-2.2.1-1-GA.deb
```

- Khởi động lại máy chủ :

```sh
sudo reboot
```

- Khởi động dịch vụ :

```sh
sudo service rundeckd start
```

- Truy cập vào địa chỉ máy chủ trên port 4440 để bắt đầu với Rundeck.

![scr2](http://i.imgur.com/HxqsoJK.png)

- Tại đây chúng ta tiếp tục ấn vào `New Project` để bắt đầu tạo 1 Project mới :

![scr3](/images/scr3.png)

- Sau khi tạo xong chúng ta sẽ được 1 project trong như thế này :

![scr4](/images/scr4.png)


# Tự động triên khai Rundeck bằng Vagrant và Ansible.

##1. Mô hình.
```sh
|                                               |------ rundeck.yml
|                             |-------- Ansible |
|                             |                 |------ hosts
|---- Kali Linux (26.26.26.1) |
|                             |
|                             |-------- Vagrant => Create VM Ubutuntu 14.04 (26.26.26.26)
|
```
##2. Thực hiện.

- Trước tiên chúng ta cần phải cài đặt `Vagrant` và `ansible` cho máy vật lý.

#### Cài đặt vagrant.

- Xem chi tiết tại [đây](https://github.com/datkk06/ghichep-vagrant-virtualbox-kvm/tree/master/Docs)

#### Cài đặt Ansible.

<i>Trên Ubuntu</i>

```sh
sudo apt-add-repository -y ppa:ansible/ansible
sudo apt-get update
sudo apt-get install -y ansible
```

<i>Trên Debian</i>

```sh
# debian 8
echo 'deb http://http.debian.net/debian jessie-backports main' > /etc/apt/sources.list.d/backports.list
apt-get update
apt-get -t jessie-backports install "ansible"
```

- Tạo file tự động cài đặt Rundeck .

```sh
sudo vi /etc/ansible/rundeck.yml
```

- Sau đó coppy đoạn playbook sau paste lại vào `rundeck.yml`: 

```sh
---
- hosts: rundekck
  sudo: yes
  tasks:
  - name: cai dat JDK 7
    apt: name=openjdk-7-jre update_cache=yes
  - name: config enviroment.
    lineinfile: dest=/etc/environmentine
                line="JAVA_HOME="/usr/lib/jvm/java-1.7.0-openjdk-amd64""
                state=present
  - name: dowload Rundeck.
    get_url:
      url=http://dl.bintray.com/rundeck/rundeck-deb/rundeck-2.7.1-1-GA.deb
      dest=/tmp
  - name: cai dat Rundeck.
    command: sudo dpkg -i /tmp/rundeck-2.2.1-1-GA.deb
  - name: start Rundeck.
    service: name=rundeckd state=started
  - name: restart machine
    command: shutdown -r now "Ansible updates triggered"
    async: 0
    poll: 0
    ignore_errors: true
```

- Chỉnh sửa file `hosts`

```sh
echo "[rundeck]" >> /etc/ansible/hosts
echo "26.26.26.26" >> /etc/ansible/hosts #IP mà chúng ta set cho VM tạo bằng vagrant.
```

- Thiết lập tự động tạo VM bằng `vagrant`

- Tạo một thư mục và tạo ra file cấu hình VM chứa trong thư mục đó:

```sh
sudo mkdir Rundeck
cd Rundeck
vagrant init
```

- Sau đó chúng ta tiến hành sửa file cấu hình :

```sh
sudo vi Vagrantfile
```

- Sửa lại các thiết lập như sau :

```sh
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  # config.vm.box = "ubuntu/trusty64"
  # config.ssh.insert_key = false
  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "/etc/ansible/rundeck.yml"
    ansible.inventory_path = "/etc/ansible/hosts"
    ansible.sudo = true
    ansible.limit = "all"
  end
```

- Lưu lại file cấu hình và tiến hành chạy :

```sh
vagrant up
```

# OK !!!

- Như thế là chúng ta đã cấu hình để triển khai tự động `Rundeck` bằng Vagrant và Ansible và đây là kết quả :

![scr8](/images/scr8.png)
