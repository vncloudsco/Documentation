---
layout: post
title: "Cài đặt OSSEC Server và Agent trên CentOS"
tags: Wazuh
description: Hướng Dẫn Cài Đặt Wazuh
comments: true
---

OSSEC là một mã nguồn mở, dựa trên hệ thống phát hiện xâm nhập (HIDS) để thực hiện các hoạt động phân tích, kiểm tra tính toàn vẹn, giám sát đăng ký Windows, phát hiện rootkit, cảnh báo theo thời gian, và phản hồi động. Nó có thể được sử dụng để theo dõi một server hoặc hàng nghìn server trong chế độ server / agent. Bài lab sẽ hướng dẫn các bạn cách cài đặt OSSEC server và agent trên hệ thống CentOS

## I. Cài đặt OSSEC sever trên CentOS
Bước 1: Cài đặt các gói cấn cho việc biên dịch và download file setup từ địa chỉ http://ossec.github.io/downloads.html
```sh
 # yum groupinstall 'Development Tools' # yum install openssl* 
 ```
Bước 2: Cài đặt OSSEC server 
```sh
 # wget https://bintray.com/artifact/download/ossec/ossec-hids/ossec-hids-2.8.3.tar.gz # tar -xzvf ossec-hids-2.8.3.tar.gz # cd ossec-hids-2.8.3 # ./install.sh



(en/br/cn/de/el/es/fr/hu/it/jp/nl/pl/ru/sr/tr) [en]:
  - System: Linux localhost.localdomain 3.10.0-514.el7.x86_64
  - User: root
  - Host: localhost.localdomain
  -- Press ENTER to continue or Ctrl-C to abort. --
1- What kind of installation do you want (server, agent, local, hybrid or help)?server

2- Setting up the installation environment.
 - Choose where to install the OSSEC HIDS [/var/ossec]:

3- Configuring the OSSEC HIDS.
  3.1- Do you want e-mail notification? (y/n) [y]: y
   - What's your e-mail address? ducdt@localhost
   - What's your SMTP server ip/host? localhost
  3.2- Do you want to run the integrity check daemon? (y/n) [y]: y
   - Running syscheck (integrity check daemon).
  3.3- Do you want to run the rootkit detection engine? (y/n) [y]: y
   - Running rootcheck (rootkit detection).
  3.4- Active response allows you to execute a specific
       command based on the events received. For example,
       you can block an IP address or disable access for
       a specific user.
       More information at:
       http://www.ossec.net/en/manual.html#active-response
       
   - Do you want to enable active response? (y/n) [y]: y
     - Active response enabled.
     
   - Do you want to enable the firewall-drop response? (y/n) [y]: y
     - firewall-drop enabled (local) for levels >= 6

   - Default white list for the active response:
      - 192.168.10.1

   - Do you want to add more IPs to the white list? (y/n)? [n]: n

  3.5- Do you want to enable remote syslog (port 514 udp)? (y/n) [y]: y
   - Remote syslog enabled.

  3.6- Setting the configuration to analyze the following logs:
    -- /var/log/messages
    -- /var/log/secure
    -- /var/log/maillog
5- Installing the system
 - Running the Makefile
INFO: Little endian set.
 *** Making zlib (by Jean-loup Gailly and Mark Adler)  ***
   
    - System is Redhat Linux.
 - Init script modified to start OSSEC HIDS during boot.
 - Configuration finished properly.

 - To start OSSEC HIDS:
                /var/ossec/bin/ossec-control start

 - To stop OSSEC HIDS:
                /var/ossec/bin/ossec-control stop

 - The configuration can be viewed or modified at /var/ossec/etc/ossec.conf
    ---  Press ENTER to finish (maybe more information below). ---
```
+ Đến đây chúng ta đã cài đặt xong OSSEC HIDS server. Toàn bộ OSSEC HIDS binaries, scripts, config files nằm trong thưc mục bạn chọn ở mục cài đặt bên trên "/var/ossec" (mặc định). Để kiểm tra hoạt động của OSSEC HIDS sử dụng câu lệnh sau
```sh
 # /var/ossec/bin/ossec-control start
Starting OSSEC HIDS v2.8.3 (by Trend Micro Inc.)...
Started ossec-maild...
Started ossec-execd...
Started ossec-analysisd...
Started ossec-logcollector...
Started ossec-remoted...
Started ossec-syscheckd...
Started ossec-monitord...
Completed.
```

+ Trước khi chúng ta chuyển sang cài đặt và cấu hình OSSEC HIDS agent, Phải đảm bảo OSSEC HIDS server có thể giao tiếp với agent trên cổng 1514 hoặc 514. Sử dụng câu lệnh sau để mở UDP port 1514 và 514

- Trên CentOS 6
```sh
 # iptables -A INPUT -p UDP --dport 1514 -s YOUR_AGENT_IP -j ACCEPT # iptables -A INPUT -p UDP --dport 1514 -s 192.168.10.131 -j ACCEPT  //agent ip: 192.168.10.131 # service iptables save  //lưu cấu hình iptables 
```
- Trên CentOS 7
```sh
 # firewall-cmd --permanent --zone=public --add-port=1514/udp  //add permanent = service iptables save # firewall-cmd --reload # firewall-cmd --permanent --list-ports   //Liệt kê các port đã add 
```
## II. Cài đặt OSSEC Agent trên CentOS
Bước 1: Cài đặt các gói cấn cho việc biên dịch và download file setup từ địa chỉ http://ossec.github.io/downloads.html
```sh 
# yum groupinstall 'Development Tools' # yum install openssl*
```
Bước 2: Cài đặt OSSEC agent 
 ```sh
 # tar -xzvf ossec-hids-2.8.3.tar.gz # cd ossec-hids-2.8.3 # ./install.sh

(en/br/cn/de/el/es/fr/hu/it/jp/nl/pl/ru/sr/tr) [en]: en
1- What kind of installation do you want (server, agent, local, hybrid or help)? agent
  - Agent(client) installation chosen.

2- Setting up the installation environment.
 - Choose where to install the OSSEC HIDS [/var/ossec]: /var/ossec
    - Installation will be made at  /var/ossec .

3- Configuring the OSSEC HIDS.

  3.1- What's the IP Address or hostname of the OSSEC HIDS server?: 192.168.10.130  //OSSEC HIDS server-ip
   - Adding Server IP 192.168.10.130

  3.2- Do you want to run the integrity check daemon? (y/n) [y]: y
   - Running syscheck (integrity check daemon).

  3.3- Do you want to run the rootkit detection engine? (y/n) [y]: y
   - Running rootcheck (rootkit detection).

  3.4 - Do you want to enable active response? (y/n) [y]: y

  3.5- Setting the configuration to analyze the following logs:
    -- /var/log/messages
    -- /var/log/secure
    -- /var/log/maillog

5- Installing the system
 - Running the Makefile
INFO: Little endian set.
....    ....    ....       
 - System is Redhat Linux.
 - Init script modified to start OSSEC HIDS during boot.
 - Configuration finished properly.
 - To start OSSEC HIDS:
                /var/ossec/bin/ossec-control start

 - To stop OSSEC HIDS:
                /var/ossec/bin/ossec-control stop

 - The configuration can be viewed or modified at /var/ossec/etc/ossec.conf

```
+ Sử dụng câu lệnh sau để mở UDP port 1514 trên OSSEC HIDS agent

- Trên CentOS 6
```sh
 # iptables -A INPUT -p UDP --dport 1514 -s YOUR_SERVER_IP -j ACCEPT # iptables -A INPUT -p UDP --dport 1514 -s 192.168.10.130 -j ACCEPT  //ossec hids server ip: 192.168.10.130 # service iptables save  //lưu cấu hình iptables 
```
- Trên CentOS 7
```sh
 # firewall-cmd --permanent --zone=public --add-port=1514/udp  //add permanent = service iptables save # firewall-cmd --reload # firewall-cmd --permanent --list-ports   //Liệt kê các port đã add 
```
## III. Quản lý Agents
+ Để OSSEC server và OSSEC agent có thể giao tiếp được với nhau. OSSEC Agents phải xác thực được với OSSEC server và OSSEC server phải xác nhận được OSSEC agent. Traffic giữa server-agent được mã hóa sử dụng pre-shared keys. Những keys này được sinh ra từ server, sau đó được imported vào agent.

+ Toàn bộ agent-key được quản lý bởi "manage_agents" 

Bước 1: Add agent vào OSSEC's server và extrack agent's key từ OSSEC's server để add vào OSSEC's agent ( centos7.tenten.vn - 192.168.10.130 )
- Quá trình này được lặp lại để tạo ra mỗi agent bạn muốn cài đặt 
```sh
 # /var/ossec/bin/manage_agents


****************************************
* OSSEC HIDS v2.8.3 Agent manager.     *
* The following options are available: *
****************************************
   (A)dd an agent (A).
   (E)xtract key for an agent (E).
   (L)ist already added agents (L).
   (R)emove an agent (R).
   (Q)uit.
Choose your action: A,E,L,R or Q: A  <- chọn A để thêm agent

- Adding a new agent (use '\q' to return to the main menu).
  Please provide the following:
   * A name for the new agent: centos7a  <- Đặt tên cho agent
   * The IP Address of the new agent: 192.168.10.131  <- Địa chỉ address của agent server 
   * An ID for the new agent[001]:
Agent information:
   ID:001
   Name:centos7a
   IP Address:192.168.10.131

Confirm adding it?(y/n): y   <- Yes để confirm 
Agent added.

+ Extract a key từ OSSEC server để import vào OSSEC agent 

 # /var/ossec/bin/manage_agents


****************************************
* OSSEC HIDS v2.8.3 Agent manager.     *
* The following options are available: *
****************************************
   (A)dd an agent (A).
   (E)xtract key for an agent (E).
   (L)ist already added agents (L).
   (R)emove an agent (R).
   (Q)uit.
Choose your action: A,E,L,R or Q: E  <- extract key 

Available agents:
   ID: 001, Name: centos7a, IP: 192.168.10.131
Provide the ID of the agent to extract the key (or '\q' to quit): 001  <- gõ agent ID mà bạn muốn extract key

Agent key information for '001' is:
MDAxIGNlbnRvczdhIDE5Mi4xNjguMTAuMTMxIGRhMjU2MGJlODA2OGQ3MDk0Yzg2Nzgy

MGU2ZTEwODA4YWZjZTA1M2MxMjM4MTBmYjRiMDI3ZTQ5ZTYyNGFkOWI=

** Press ENTER to return to the main menu.
```
Bước 2: Import agent key đã extract ở trên vào OSSEC agent ( centos7a.itlabvn.net - 192.168.10.131 )
+ Các bạn chạy manage_agents sau đó chọn "I" để import key và paste agent's key thu được từ OSSEC server  
```sh
 # /var/ossec/bin/manage_agents
****************************************
* OSSEC HIDS v2.8.3 Agent manager.     *
* The following options are available: *
****************************************
   (I)mport key from the server (I).
   (Q)uit.
Choose your action: I or Q: I   <- chọn I để import key từ server vào agent 

* Provide the Key generated by the server.
* The best approach is to cut and paste it.
*** OBS: Do not include spaces or new lines.

Paste it here (or '\q' to quit):MDAxIGNlbnRvczdhIDE5Mi4xNjguMTAuMTMxIGRhMjU2MGJlODA2OGQ3                                              MDk0Yzg2NzgyMGU2ZTEwODA4YWZjZTA1M2MxMjM4MTBmYjRiMDI3ZTQ5ZTYyNGFkOWI=

Agent information:
   ID:001
   Name:centos7a
   IP Address:192.168.10.131

Confirm adding it?(y/n): y
```


+ Đến đây quá trình cài đặt OSSEC agent đã hoàn thành. Chúng ta start OSSEC HIDS service trên cả server & agent bằng câu lệnh sau
```sh
 # /var/ossec/bin/ossec-control restart
ossec-logcollector not running ..
ossec-syscheckd not running ..
ossec-agentd not running ..
Killing ossec-execd ..
OSSEC HIDS v2.8.3 Stopped
Starting OSSEC HIDS v2.8.3 (by Trend Micro Inc.)...
Started ossec-execd...
2017/02/20 04:54:37 ossec-agentd: INFO: Using notify time: 600 and max time to reconnect: 1800
Started ossec-agentd...
Started ossec-logcollector...
Started ossec-syscheckd...
Completed.
```
+ Chúng ta có thể restart the OSSEC agent  trực tiếp từ OSSEC server (centos7.itlabvn.net) với câu lệnh.
```sh
 # /var/ossec/bin/agent_control -R 001   //001 agent's ID
 ```
Bước 3: Kiểm tra kết quả 
+ Trên OSSEC HIDS server (centos7.itlabvn.net - 192.168.10.130). Sử dụng "list_agents" để liệt kê toàn bộ OSSEC agents đã add trên server 
```sh
 [root@centos7 ~]# /var/ossec/bin/list_agents -c centos7a-192.168.10.131 is active
 ```
- Đến đây chúng ta đã hoàn thành xong bài lab cài đặt OSSEC trên hệ thống CentOS. Chúc các bạn làm lab thành công!
