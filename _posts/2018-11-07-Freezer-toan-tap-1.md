---
layout: post
title: "Vận Hành Freezer Phần 1 Giới Thiệu Và Cài Đặt"
tags: Freezer
description: Freezer là một Backup Restore DR as a Service giúp sao lưu và khôi phục tự động
comments: true
author: VNC
---

Freezer là một Backup Restore DR as a Service giúp sao lưu và khôi phục tự động

Tính năng của Freezer:

- Sao lưu Filesytem sử dụng snapshot
- Hỗ trợ mã hóa dữ liệu backup mạnh: AES-256-CFB
- Sao lưu Filesytem tree trực tiếp không cần thực hiện volume snapshot
- Backup Journal MongoDB tree sử dụng lvm snapshot. Đẩy dữ liệu backup vào Swift
- Sao lưu MySQL DB sử dụng lvm snapshot
- Khôi phục dữ liệu vào filesytem tự động theo thời gian được chỉ định trước
- Tiêu tốn dung lượng lưu trữ thấp
- Chính sách backup linh hoạt (backup incremental hay backup differential)
- Dữ liệu backup được lưu dưới định dạng tar, hỗ trợ backup incremental
- Hỗ trợ nhiều thuật toán nén dữ liệu (zlib, bzip2, xz)
- Xóa tự động các file backup cũ
- Hỗ trợ lưu trữ backup xuống nhiều loại backend như Swift, local file system, remote server thông qua ssh)
- Hỗ trợ nhiều nền tảng (Linux, Windows, BSD, OSX)
- Quản lý nhiều jobs (chạy nhiều backup trên cùng một node)
- Đồng bộ dữ liệu backup và khôi phục trên nhiều node
- Quản lý trên Openstack Horizon
- Có thể chạy script, command trước khi hoặc sau tiến trình backup



# Các thành phần trong Project Freezer

![](http://image.prntscr.com/image/9803fae8ff65417a90150afb1079456d.png)


## 1. Freezer WebUI
 Giao diện web tương tác với Freezer API để thực hiện việc config và thay đổi thông số. Nó cung cấp hầu hết các tính năng tương tự như Freezer Agent CLI, các tùy chọn đặt lịch nâng cao như đồng bộ việc backup giữa nhiều node, đặt metric, báo cáo.

## 2. Freezer Scheduler
 Thành phần được cài đặt phía client, chạy trên các node cần thực hiện backup. Bao gồm một daemon nhận dữ liệu từ freezer API và thực thi các jobs (VD như backup, restore, quản trị, lấy thông tin, thực thi các script trước và sau backup) bằng cách chạy Freezer Agent. Các metrics và exit codes được trả vể bởi Freezer Agent được bắt lại và trả về Freezer API. Freezer scheduler quản lý các tiến trình và đồng bộ nhiều tác bụ thực hiện trên một node hay nhiều node. Trạng thái và kết quả của tác vụ được trả về qua API. Freezer Scheduler thực hiện việc upload thông tin các jobs vào API bằng cách đọc các file trên file system. Có thể cấu hình job session hoặc các thông số khác như Freezer API interval polling. 

## 3. Freezer Agent
 Được viết bằng Python, chạy phía client, thực hiện việc backup dữ liệu. Nó có thể chạy độc lập hoặc được điều khiển bởi Freezer Scheduler. Freezer Agent linh hoạt trong việc thực thi backup, restore hay các tác vụ khác trong hệ thống đang chạy. Để đảm bảo tính nhất quán của dữ liệu, tốc độ, hiệu năng, tài nguyên sử dụng,... Freezer Agent cung cấp các lựa chọn sau để thực hiện các bản backup tối ưu nhât:
 - Segment size: kích thước bộ nhớ sử dụng.
 - Queue size: tối ưu việc backup khi I/O, bandwidth, RAM hay CPU bị giới hạn.
 - I/O Affinity và Process Priority : sử dụng với I/O thời gian thực và ưu tiên các process người dùng.
 - Giới hạn băng thông
 - Mà hóa phía người dùng (AES-256-CFB)
 - Nén : sử dụng nhiều thuật toán như zlib, bzip2, xz/lzma
 - Upload song song tới hệ thống lưu trữ : backup vào swift , remote node bằng SSH, ...
 - Thực thi việc backup incremental theo dạng file (tar), dạng block (như rsync) và backup differential.
 - Chạy trên nhiều nền tảng: Linux, Windows, BSD, OSX.
 - Tự động xóa các bản backup cũ.

## 4. Freezer API
 API được dùng để lưu trữ và cung cấp metadata cho Freezer Web UI và Freezer Scheduler. API cũng được dùng để lưu các thông tin session cho việc đồng bộ backup nhiều node. Không có dữ liệu tải thực nào được lưu trong API.

## 5. DB Elasticsearch
 Backend cho API để lưu trữ và nhận metric, thông tin metadata session, tình trạng job,...

# Kiến trúc, mối tương quan giữa các thành phần trong Freerer
![hinh anh](http://image.prntscr.com/image/34ab0c8458b04a0abcc68d2eea46d7ac.png)

- 1.Admin lên lịch thực hiện backup 
Admin lên lịch backup trên horizon. 

- 2.Xác thực với keystone
Xác thực với Keystone quyền hạn của user

- 3.Gọi Feezer API
Yêu cầu được gửi đến thành phần Freezer API

- 4.Ghi database
Frezzer nhận được yêu cầu, cập nhật trạng thái và ghi vào database Elasticsearch

- 5.Freezer Scheduler nhận jobs
Freezer quản lý job backup bằng gửi lời gọi đến Freezer API để lấy jobs backup.

- 6.Xác thực với Keystone
Freezer API xác thực với Keystone, cấp quyền backend vào Swift cho Freezer Agent

- 7.Feezer agent thực hiện backup 
Sau khi nhận được yêu cầu backup từ Freezer scheduler, Freezer agent thực hiện backup và sao lưu vào Swift
- 8.Backup mount local
Trong trường hợp không sử dụng API, sau khi lên lịch backup, Freezer Schedule gửi yêu cầu backup đên Freezer Agent thực hiện backup. Tiến trình backup thực hiện sao lưu dữ liệu xuống phân vùng mount (có thể là NFS, GlusterFS). Dữ liệu được load lên RAM máy local trước khi được nghi xuống phân vùng mount

- 9.Backup remote FS
Khi thực hiện quá trình backup, ngoài việc sao lưu dữ liệu đến phân vùng mount ta có thể đẩy dữ liệu backup đến một server khác thông qua SSH.

## 1.Freezer Agent backup workflow
![](http://image.prntscr.com/image/cd1712df843246dc8ee2045de612a4e3.png)

 - 1: Freezer Scheduler gửi yêu cầu tạo backup tới Freezer Agent
 - 2: Nếu trước đó đã có backup, Freezer Agent kiểm tra backup metadata từ Object Storage (là vùng lưu trữ các bản backup), Object Storage sẽ xác thực với Keystone trước khi trả backup metadata về Freezer Agent.
 - 3: Freezer Agent tiến hành backup, đẩy lên Object Storage, Object storage xác thực với Keystone, sau khi hoàn tất upload, Object Storage phản hồi lại cho Freezer Agent.
 - 4: Freezer Agent trả lại backup metadata cho Freezer Scheduler, sau đó Freezer Scheduler upload các thông tin về bản backup lên Elastic Search.

## 2.Freezer Scheduler workflow
![](http://image.prntscr.com/image/f1ef98a30d97482690a936b05923e9d3.png)
 - 1: Freezer Scheduler tiến hành xác thực với Keystone (Username và password), nếu đúng Keystone sẽ gửi về 1 token.
 - 2: Freezer Scheduler gửi yêu cầu lấy job list (là  tác vụ backup được đặt lịch) thông qua API cùng với token, sau khi được xác thực, job list sẽ được trả về từ Elastic Search.
 - 3: Khi tiến hành backup, Freezer Scheduler update thông tin job lên Elastic Search qua Freezer API.
 - 4: Freezer Agent tiến hành Backup và trả lại metadata cho Freezer Scheduler.
 - 5: Freezer Scheduler update thông tin job đã hoàn thành lên Elastic Search.
 - 6: Nếu Freezer Scheduler có backup metadata, nó sẽ gửi thông tin về bản backup lên Elastic Search.


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



