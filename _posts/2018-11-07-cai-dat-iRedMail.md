---
layout: post
title: "Hướng Dẫn Cài Đặt iRedMail "
tags: Rundec
description: iRedMail được thiết kế để cài đặt cho một máy chủ FRESH, có nghĩa rằng máy chủ của bạn chưa từng cài đặt MySQL
comments: true
author: VNC
---

### 1. Yêu cầu hệ thống

iRedMail được thiết kế để cài đặt cho một máy chủ FRESH, có nghĩa rằng máy chủ của bạn chưa từng cài đặt MySQL, OpenLDAP, Postfix, Dovecot, Amavisd,... iRedMail sẽ tự động cài đặt và cấu hình các thành phần trên một cách tự động.

Tóm lại, để cài đặt được iRedMail trên CentOS 7:

- Một server sử dụng OS CentOS 7 và đã cài đặt repo EPEL
- RAM khuyến nghị là 2GB
- 3 UID/GID: 2000, 2001, 2002
- Bộ cài của iRedMail: https://www.iredmail.org/download.html

<a name="2"></a>

### 2. Chuẩn bị cài đặt

#### 2.1 Cài đặt EPEL

```
yum install -y wget epel-release
```

Trường hợp `epel-release` và `wget` đã được cài sẵn trên server.

<img src="/images/ired-epel.png" />

#### 2.2 Tải iRedMail

- Tải iRedMail mới nhất tại: https://www.iredmail.org/download.html

Trong thời điểm viết bài, iRedMail mới nhất là phiên bản 0.9.7

```
cd /opt
wget https://bitbucket.org/zhb/iredmail/downloads/iRedMail-0.9.7.tar.bz2
```

<img src="/images/ired-download.png" />

- Giải nén bản cài đặt

```
cd /opt
tar -xjf iRedMail-0.9.7.tar.bz2
```

<img src="/images/ired-extract.png" />

#### 2.3 Đặt hostname (FQDN)

- Cài đặt hostname cho server

```
hostnamectl set-hostname mail.diennuocdaiphong.com
```

Lưu ý: Thay thế domain của bạn vào câu lệnh

- Kiểm tra lại hostname

```
hostname -f
```

- Khai báo vào file `/etc/hosts`

```
127.0.0.1   mx.example.com mx localhost localhost.localdomain
```

- Vô hiệu hóa SELinux

```
setenforce 0
sed -i --follow-symlinks 's/^SELINUX=.*/SELINUX=disabled/g' /etc/sysconfig/selinux
```

<a name="3"></a>
### 3. Tiến hành cài đặt

- Truy cập vào folder và chạy script cài đặt iRedMail

```
cd /opt/iRedMail-0.9.7
bash iRedMail.sh
```
- Màn hình `Welcome` xuất hiện, chọn `Yes` để tiếp tục

<img src="/images/ired-welcome.png" />

- Chọn nơi lưu trữ email `Default mail storage path`, chọn `Next` để tiếp tục

<img src="/images/ired-store.png" />

- Chọn web server (Bấm `SPACE` để chọn) 

Trong lần cài đặt này, chúng ta chọn Apache vì nó được sử dụng khá rộng dãi. Sau đó bấm `Next`.

<img src="/images/ired-web-server.png" />

- Chọn nơi lưu trữ thông tin user (Bấm `SPACE` để chọn) 

Chúng ta chọn MySQL. Sau đó bấm `Next`...

<img src="/images/ired-database.png" />

- Đặt mật khẩu cho `root` của MySQL. Sau đó bấm `Next` để tiếp tục.

<img src="/images/ired-mysql.png" />

- Khai báo Domain của hòm mail

<img src="/images/ired-domain.png" />

- Khai báo password cho `postmaster` (Tài khoản quản trị hòm mail)

<img src="/images/ired-postmaster.png" />

- Cài đặt các tiện ích (Webmail, Calender, Contacts,...)

<img src="/images/ired-ultis.png" />

- Xem lại các thiết lập bên trên và chọn `Y` để tiếp tục

<img src="/images/ired-summary.png" />

- Chờ quá trình cài đặt đang diễn ra

<img src="/images/ired-processing.png" />

- Trong quá trình cài đặt, iRedMail sẽ hỏi chúng ta về phần mở port cho SSH và phần cấu hình cho MySQL. Chọn `Y` để tiếp tục.

<img src="/images/ired-ssh-mysql.png" />

- Quá trình hoàn tất

<img src="/images/ired-final.png" />

<a name="4"></a>
### 4. Cấu hình các bản ghi DNS

- Lấy bản ghi DKIM cho Mail server

Chúng ta sử dụng lệnh `amavisd` để tạo ra bản ghi DKIM.

```
amavisd -c /etc/amavisd/amavisd.conf showkeys
```

<img src="/images/ired-dkim.png" />

Chúng ta lấy phần chuỗi trong `()` và bỏ hết `"`, DKIM có dạng như sau:

```
v=DKIM1; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYArsr2BKbdhv9efugBy...
```

- Các bản ghi cần thiết:

Bản ghi | Name | Dữ liệu | Prority |
--|--|--|--|
A | mail |x.x.x.x | null |
MX | @ |x.x.x.x | 5 |
TXT | @ | "v=spf1 mx mx:mail.diennuocdaiphong.com -all" | null |
TXT | dkim._domainkey | v=DKIM1; p=MIGfMA0kRCvdXXXXXXXXXXXXX | null |

- Sau khi khai báo lên DNS, chúng ta kiểm tra lại DKIM bằng lệnh.

```
amavisd -c /etc/amavisd/amavisd.conf testkeys
```

<img src="/images/ired-dkim-test.png" />

