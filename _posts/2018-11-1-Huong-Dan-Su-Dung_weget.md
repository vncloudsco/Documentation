---
layout: post

title: "Hướng Dẫn Sử Dụng Wget"

tags: wget

description: Hướng Dẫn Sử Dụng Wget

comments: true
---

Bài hướng dẫn này sẽ cho bạn biết cách dùng wget command trong Linux. Chúng tôi cũng cho ví dụ về 12 lệnh wget hữu dụng. Kết quả là bạn sẽ biết toàn bộ cách dùng wget và có thể tải file từ World Wide Web.

Wget Command là gì?
Wget là một công cụ máy tính tạo ra từ GNU Project. Bạn có thể dùng nó để trích xuất dữ liệu và nội dung từ nhiều web servers khác nhau. Tên của nó là kết hợp của World Wide Web và từ get. Nó hỗ trợ download qua FTP, SFTP, HTTP, và HTTPS.

Wget được tạo ra từ portable C và có thể dùng trên bất kỳ Unix system nào. Nó cũng có thể được triển khai trên Mac OS X, Microsoft Windows, AmigaOS và các nền tảng phổ biến khác.

Làm thế nào để cài đặt Wget?
Để thực hiện bài hướng dẫn wget command này, chúng tôi sẽ dùng hệ điều hành Ubuntu 16.04. Nhưng cấu trúc lệnh có thể dùng được trên các bản Linux khác.

Đầu tiên, truy cập server qua SSH. Thực thi lệnh sau để cài đặt wget trên máy:

apt-get install wget
Khi quá trình cài đặt kết thúc, bạn có thể bắt đầu sử dụng. Ngoài ra, kiến thức cơ bản về SSH cũng có thể giúp ích cho bạn rất nhiều.

Ví dụ về Wget Command
Chúng tôi cho bạn 12 ví dụ về lệnh wget command mà bạn có thể sẽ dùng hằng ngày. Hãy lưu ý là bạn cũng có thể dùng function này từ scripts và cron jobs!

Sử dụng Wget Command để tải từng Files
Một trong các lệnh wget cơ bản nhất là tải file và lưu nó vào thư mục hiện hành. Ví dụ, nếu bạn muốn tải version mới nhất của WordPress, hãy dùng lệnh sau:
```sh
wget https://wordpress.org/latest.zip
```
Kết quả:
```sh
--2018-02-23 12:53:10-- https://wordpress.org/latest.zip
Resolving wordpress.org (wordpress.org)... 198.143.164.252
Connecting to wordpress.org (wordpress.org)|198.143.164.252|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 9332728 (8,9M) [application/zip]
Saving to: 'latest.zip'

latest.zip 100%[===================>] 8,90M 6,88MB/s in 1,3s

2018-02-23 12:53:14 (6,88 MB/s) - 'latest.zip' saved [9332728/9332728]
```
Trong ví dụ này, một file có tên latest.zip sẽ được tải vào thư mục đang sử dụng. Bạn sẽ thấy có thêm các thông tin khác như, tiến trình tỉa, tốc độ, kích thước, thời gian và ngày.

Sử dụng Wget Command để tải nhiều Files
Chúng tôi có thể dùng wget vào việc tải nhiều file cùng một lúc. Để làm vậy, bạn cần tạo một file text và đặt các đường dẫn URLs tải file vào đó. Trong ví dụ này, chúng tôi sẽ tải bản mới nhất của WordPress, Joomla, và Drupal. Nhập lệnh sau:
```sh
nano example.txt
```

Lệnh này sẽ tạo một file có tên example.txt và mở text ditor. Dán links sau vào:
```sh
https://wordpress.org/latest.zip

https://downloads.joomla.org/cms/joomla3/3-8-5/Joomla_3-8-5-Stable-Full_Package.zip

https://ftp.drupal.org/files/projects/drupal-8.4.5.zip
```
Sau đó bạn có thể dùng -i để lấy tất cả các files chứa trong file example:
```sh
wget -i example.txt
```
Đợi một lúc quá trình tải về sẽ hoàn tất và bạn đã có 3 phiên bản quản trị nội dung phổ biến nhất.

Sử dụng Wget Command để tải Files dưới một tên khác
Trong ví dụ wget này, chúng tôi sẽ lưu file bằng một tên khcá với option -O:
```sh
wget -O wordpress-install.zip https://wordpress.org/latest.zip
Trong trường hợp này, nguồn tải được lưu thành wordpress-install.zip thay vì tên gốc.
```
Sử dụng Wget Command để lưu file trong một thư mục được chỉ định
Bạn có thể tận dụng wget để đặt file vào một thư mục khác bằng tùy chọn -P:
```sh
wget -P documents/archives/ https://wordpress.org/latest.zip
File bạn tải về sẽ xuất hiện trong thư mục documents/archives/.
```
Sử dụng Wget Command để giới hạn tốc độ tải về
Với wget, bạn có thể giới hạn tốc độ tải. VIệc này hữu dụng trong trường hợp bạn tải một file lớn và tránh trường hợp nó dùng hết băng thông của bạn. Ví dụ bên dưới sẽ giới hạn còn 500k:
```sh
wget --limit-rate=500k https://wordpress.org/latest.zip
```
Sử dụngWget Command để đặt số lần thử tải lại
Kết nối internet có thể gây lỗi giản đoạn. Để xử lý, chúng ta có thể tăng số lần thử tải lại bằng cách dùng option -tries :
```sh
wget -tries=100 https://wordpress.org/latest.zip
```
Sử dụng Wget Command để tải file trong Background
Đối với các files cực lớn, bạn có thể dùng function -b. Nó sẽ chạy ẩn dưới nền
```sh
wget -b http://example.com/beefy-file.tar.gz
```
Một wget-log sẽ xuất hiện trong thư mục hiện hành, bạn có thể kiểm tra tiến trình và tình trạng. Lệnh này sẽ giúp bạn kiểm tra nó:
```sh
tail -f wget-log
```
Sử dụng Wget Command để tải file qua FTP
Lệnh này có thể dùng với FTP. Bạn chỉ cần đặt đúng tên và password như trong trường hợp sau:
```sh
wget --ftp-user=YOUR_USERNAME --ftp-password=YOUR_PASSWORD ftp://example.com/something.tar
```
Sử dụng Wget Command để tiếp tục file tải bị gián đoạn
Việc download có thể bị gián đoạn nếu kết nối gặp vấn đề. Việc này thường xảy ra khi bạn đang tải file lớn. Thay vì tải lại từ đầu, bạn có thể tiếp tục bằng function -c:
```sh
wget -c https://example/very-big-file.zip
```
If you proceed without the -c function, the new file will have .1 added at the end as it already exists.

Sử dụng Wget Command để tải về toàn bộ website
Bạn cũng có thể dùng lệnh wget để tải về toàn bộ site. Nó sẽ cho bạn xem trên máy không cần kết nối internet. Sử dụng lệnh như sau:

```sh wget --mirror --convert-links --page-requisites --no-parent -P documents/websites/ https://some-website.com ```
Hãy phân tích các trường trong lệnh wget:

–mirror	Nó giúp bạn tải theo dạng recursive.
–convert-links	Tất cả các links sẽ được chuyển thành link trên offline.
–page-requisites	Lệnh này sẽ bao gồm tất cả các files cần thiết như là CSS, JS, và hình ảnh
–no-parent	Nó đảm bảo là không có thư mục nào ở trên thư mục website bị tải về
-P documents/websites/	Đảm bảo tất cả nội dung được lưu vào thư mục được chỉ định.
Khi hoàn tất, bạn có thể mở website trên máy và tìm thấy tất cả các file cần thiết trong thư mục documents/websites/

Sử dụng Wget Command để xác định link lỗi
Hãy dùng lệnh một cách cao cấp hơn. Bạn có thể dùng wget command để xác định broken URL mà hiện lỗi 404 error trên website của bạn. Bằng cách thực thi lệnh sau:
```sh
wget -o wget-log -r -l 5 --spider http://example.com
```
-o	Nhóm tất cả các output vào một file để sử dụng sau
-l	Xác định cấp độ recursive
-r	Khiến file tải về ở chế độ recursive
–spider	Đặt wget ở spider mode
Chúng ta sẽ tiếp tục điều tra thêm file wget-log để xác định link lỗi. Đây là lệnh để thực thi việc này:
```sh
grep -B 2 '404' wget-log | grep "http" | cut -d " " -f 4 | sort -u
```
Sử dụng Wget Command để tải file theo số
Nếu bạn có hình hoặc file bị đánh số theo một danh sách nhất định, bạn có thể tải toàn bộ chúng bằng cấu trúc sau:
```sh
wget http://example.com/images/{1..50}.jpg
```
Lời kết

Chúc mừng. Bằng cách hoàn tất bài hướng dẫn này bạn đã học cách làm thế nào để sử dụng wget một cách thật chuyên nghiệp. Bạn có thể tận dụng nó để tải một hoặc nhiều files. Hơn nữa, bạn cũng có thể dùng tính năng cao cấp của nó là tải toàn bộ website và xác định link lỗi. Để biết thêm thông tin, hãy xem thêm phần tài liệu chính thức này
