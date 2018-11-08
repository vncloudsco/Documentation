---
layout: post
title: "Hướng Dẫn Fix Bug Trên Freezer"
tags: Freezer
description: Freezer agent không xác thực được với Keystone V3 do file openstack.py thiếu thông tin user_domain_id và project
comments: true
author: VNC
---
### 1. Bug Keystone Version

Ở bản stable/mitaka Freezer agent không xác thực được với Keystone V3 do file openstack.py thiếu thông tin user_domain_id và project_domain_id. Hiện tại ở bản master đã code đã fig bug này

![](http://image.prntscr.com/image/d9a62cf43b9446298564a028be099e57.png)

Nội dung file openstack.py:


![](http://image.prntscr.com/image/167d4ce50e66400b908121ba58114103.png)


Fix: thêm thuộc tính  user_domain_id và project_domain_id:

![](http://image.prntscr.com/image/808d252cd6d8437e819c3e52e09050c3.png)


![](http://image.prntscr.com/image/92ac125300794678b7ebd4aab200718e.png)


![](http://image.prntscr.com/image/9ec0ec1100334bf7b05a6b6514a82f64.png)


code

```
"""
(c) Copyright 2015,2016 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
import os


class OpenstackOptions:
    """
    Stores credentials for OpenStack API.
    Can be created using
    >> create_from_env()
    or
    >> create_from_dict(dict)
    """
    def __init__(self, user_name, tenant_name, project_name, auth_url,
                 password, identity_api_version, tenant_id=None,
                 region_name=None, endpoint_type=None, cert=None,
                 insecure=False, verify=True, project_domain_name= None, user_domain_name = None ):
        self.user_name = user_name
        self.tenant_name = tenant_name
        self.auth_url = auth_url
        self.password = password
        self.tenant_id = tenant_id
        self.project_name = project_name
        self.identity_api_version = identity_api_version
        self.region_name = region_name
        self.endpoint_type = endpoint_type
        self.cert = cert
        self.insecure = insecure
        self.verify = verify
        self.project_domain_name = project_domain_name
        self.user_domain_name = user_domain_name
        if not (self.password and self.user_name and self.auth_url and
           (self.tenant_name or self.project_name)):
            raise Exception("Please set up in your env:"
                            "OS_USERNAME, OS_TENANT_NAME/OS_PROJECT_NAME,"
                            " OS_AUTH_URL, OS_PASSWORD")

    @property
    def os_options(self):
        """
        :return: The OpenStack options which can have tenant_id,
                 auth_token, service_type, endpoint_type, tenant_name,
                 object_storage_url, region_name
        """
        return {'tenant_id': self.tenant_id,
                'tenant_name': self.tenant_name,
                'project_name': self.project_name,
                'identity_api_version': self.identity_api_version,
                'region_name': self.region_name,
                'endpoint_type': self.endpoint_type,
                'project_domain_name': self.project_domain_name,
                'user_domain_name': self.user_domain_name}

    @staticmethod
    def create_from_env():
        return OpenstackOptions.create_from_dict(os.environ)

    @staticmethod
    def create_from_dict(src_dict):
        return OpenstackOptions(
            user_name=src_dict.get('OS_USERNAME', None),
            tenant_name=src_dict.get('OS_TENANT_NAME', None),
            project_name=src_dict.get('OS_PROJECT_NAME', None),
            auth_url=src_dict.get('OS_AUTH_URL', None),
            identity_api_version=src_dict.get('OS_IDENTITY_API_VERSION',
                                              '2.0'),
            password=src_dict.get('OS_PASSWORD', None),
            tenant_id=src_dict.get('OS_TENANT_ID', None),
            region_name=src_dict.get('OS_REGION_NAME', None),
            endpoint_type=src_dict.get('OS_ENDPOINT_TYPE', None),
            cert=src_dict.get('OS_CERT', None),
            insecure=False,
            verify=True,
            project_domain_name=src_dict.get('OS_PROJECT_DOMAIN_NAME', None),
            user_domain_name=src_dict.get('OS_USER_DOMAIN_NAME', None)
        )

```

### 2. Bug Nova Backup

Khi backup VM thì đầu tiên sẽ tạo  bản snapshot của VM, upload image vào Swift và sau đó xóa image đi. Khi freezer tiến hành backup thì gặp bug MemoryError do quá trình dowload image những image dung lượng lớn vào RAM rồi đẩy vào swift. Hiện tại tính đến ngày 27/10/2016 ở cả branch master và stable/mitaka đều dính bug này 

![](http://image.prntscr.com/image/270b0d48e16a45b1a257283df3511ee0.png)


Fix: trong file tại đường dẫn: /usr/lib/python2.7/dist-packages/keystoneauth1/session.py đưa dòng lệnh

```
text = self._remove_service_catalog(response.text)
```
vào try catch

```
try:
    text = self._remove_service_catalog(response.text)
except MemoryError:
    text = '{body is to huge to show, sorry}'
```
![](http://image.prntscr.com/image/6d0cf5e58c23431e981a46494023cf4f.png)

Quá trình này sẽ bỏ qua quá trình dowload image vào RAM do tràn bộ nhớ và đẩy trực tiếp xuống Swift.

### 3. Điều chỉnh kích thước từng segment upload lên Swift (Byte), thực hiện trên node client
```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/osclients.py

def download_image(self, image):
        """
        ...
        return utils.ReSizeStream(stream, image.size, 1000000) #Sua thanh kich thuoc mong muon

 ```

### 4. Điều chỉnh kích thước chunk download từ Swift (Byte), thực hiện trên node client
```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/restore.py

def _create_image(self, path, restore_from_timestamp):
        """
        ...

        stream = swift.get_object(self.container, "%s/%s" % (path, backup),
                                  resp_chunk_size=10000000) #Sua thanh kich thuoc mong muon
        ...

```

### 5. Backup metadata sau khi thực hiện backup VM

```
freezer-agent --nova-inst-id cfa52799-3d89-4895-92fc-73d0c39f2907 --path-to-backup /root/adminv3.sh --debug --container vm_cr2 --backup-name vm_long_snap --storage swift --log-file /root/logvmha


Backup metadata received: {"ssh_port": 22, "consistency_checksum": "", "curr_backup_level": 0, "backup_name": "vm_long_snap", "container": "vm_cr2", "compression": "gzip", "dry_run": "", "hostname": "controller", "storage": "swift", "vol_snap_path": "/root/adminv3.sh", "os_auth_version": "", "client_os": "linux2", "time_stamp": 1478349463, "container_segments": "", "ssh_username": "", "path_to_backup": "/root/adminv3.sh", "ssh_key": "", "proxy": "", "always_level": "", "max_level": "", "backup_media": "nova", "ssh_host": "", "mode": "fs", "fs_real_path": "/root/adminv3.sh", "action": "backup", "client_version": "3.0.0", "log_file": "/root/logvmha"}
```

### 6. Fix bug không xóa Snapshot Volume sau khi backup volume Snapshot (sử dụng backend Ceph và đặt `rbd_flatten_volume_from_snapshot = false`)
```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/backup.py
def backup_cinder_by_glance(self, volume_id):
    ...
    LOG.debug("Deleting temporary volume")
    cinder.volumes.delete(copied_volume)
    LOG.debug("Deleting temporary snapshot")
    client_manager.clean_snapshot(snapshot)
    LOG.debug("Deleting temporary image")
    client_manager.get_glance().images.delete(image.id)
    ...
```

### 7. Fix bug không xóa VM Snapshot sau khi Backup lên Swift xong 
*Nguyên nhân do sử dụng Ceph làm Backend Glance, Glance api v2 không thể xóa image (Image status owner: None), do đó phải dùng Glance api v1 để xóa*

```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/osclients.py

def __init__(self, auth_url, auth_method='password', **kwargs):
    ...
    self.glancev1 = None
    ...

def get_glance_v1(self):
    """
    Get glanceclient instance
    :return: glanceclient instance
    """
    if not self.glancev1:
        self.glancev1 = self.create_glance_v1()
    return self.glancev1
    ...

def create_glance_v1(self):
    """
    Use pre-initialized session to create an instance of glance client.
    :return: glanceclient instance
    """
    if 'endpoint_type' in self.client_kwargs.keys():
        self.client_kwargs.pop('endpoint_type')
    if 'insecure' in self.client_kwargs.keys():
        self.client_kwargs.pop('insecure')
    self.glancev1 = glance_client('1', session=self.sess,
                                **self.client_kwargs)
    return self.glancev1

```

```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/backup.py

def backup_nova(self, instance_id):
    ...
    glancev1 = client_manager.get_glance_v1()
    glancev1.images.delete(image.id)
    ...
def backup_cinder_by_glance(self, volume_id):
    ...
    client_manager.get_glance_v1().images.delete(image.id)
    ...
``` 

### 8. Fix bug không xóa Image sau khi restore volume 
*Chú ý chỉ thực hiện được khi Cinder và Glance không cùng Ceph backend*

```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/restore.py
    def restore_cinder_by_glance(self, volume_id, restore_from_timestamp):
        ...
        client_manager = self.client_manager
        cinder = client_manager.get_cinder()
        volume_id_raw = client_manager.get_cinder().volumes.create(size,
                                                        imageRef=image.id)
        volume_id_str = str(volume_id_raw)
        volume_id = volume_id_str.split(':')[1].strip(' ').strip('>')
        LOG.info(volume_id)
        volume = cinder.volumes.get(volume_id)
        while volume.status != 'available':
            time.sleep(5)
            try:
                volume = cinder.volumes.get(volume_id)
            except Exception as e:
                LOG.error(e)

        self.client_manager.get_glance_v1().images.delete(image) #Nếu sử dụng Ceph backend phải dùng glance api v1
        ...
    def restore_nova(self, instance_id, restore_from_timestamp,
                     nova_network=None):
        glancev1 = self.client_manager.create_glance_v1()
        glancev1.images.delete(image.id)
        ...

```

### 9. Fix bug không xóa Image sau khi restore VM
*Chú ý chỉ thực hiện được khi Nova và Glance không cùng Ceph backend*
```
vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/restore.py

    def restore_nova(self, instance_id, restore_from_timestamp,
                     nova_network=None):
        ...
        glancev1 = self.client_manager.create_glance_v1()
        glancev1.images.delete(image.id)
        ...

```
### 10. Fix bug không restore from date

Hiện tại ở bản master tính đến ngày 08/11/2016 khi thực hiện restore theo thời gian ta gặp phải lỗi này

![](http://image.prntscr.com/image/9d52ac1c998946a6b1ff8e8f4e48b55f.png)

CODE
```
vim /usr/local/lib/python2.7/dist-packages/freezer/storage/base.py
```

![](http://image.prntscr.com/image/d47c9baf36654d4aae4b6a4cdd4ba79d.png)
```
vim /usr/local/lib/python2.7/dist-packages/freezer/storage/physical.py
```

![](http://image.prntscr.com/image/fddf337bceaf4cfbb2a4113206b76c36.png)

FIX BUG

```
vim /usr/local/lib/python2.7/dist-packages/freezer/job.py
```

![](http://image.prntscr.com/image/4830ae120baf497e9ce5ce97345d5117.png)

```
vim /usr/local/lib/python2.7/dist-packages/freezer/storage/base.py
```

![](http://image.prntscr.com/image/ebab93eff6c34fd8914b74960fb41261.png)
```
vim /usr/local/lib/python2.7/dist-packages/freezer/storage/physical.py
```
![](http://image.prntscr.com/image/55e86bbf2fa64778825b6cfd639294b6.png)

vim /usr/local/lib/python2.7/dist-packages/freezer/openstack/restore.py
```
    def _get_backups(self, path, restore_from_timestamp):
         backups = list(filter(lambda x: x <= restore_from_timestamp, backups))
```


### 11. Tổ chức các file trong thư mục backup
![](http://image.prntscr.com/image/e46faeafd28041e2bd28abbb0872b5fb.png)
Một thư mục backup bao gồm các thư mục con
 - Data: chứa file backup (full và incremental)
 - Metadata: chứa metadata của bản backup, gồm các thông tin về công cụ mã hóa, nén và lưu trữ
    Một metadata file như sau:
   `{"encryption": false, "compression": "gzip", "engine_name": "tar"}`
 
 
VD về một thư mục backup:
Trong đó:
 - `zabbix_test`: tên của bản backup được khai báo khi thực hiện backup
 - `1478581647`: Linux epoch time tại thời điểm bản backup được khởi tạo full
 - `0_1478581647`: bản backup đầu tiên từ lúc backup full tại thời điểm `1478581647`

Khôi phục lại một bản backup
`gzip -d < file.data | tar xvf - `


### 12. Fix bug không restore được qua SSH
*Do SFTP đã bị đóng phiên, cần mở phiên mới để lấy metadata từ remote Server về*
```
vim /usr/local/lib/python2.7/dist-packages/freezer/storage/ssh.py
    ...
    def get_file(self, from_path, to_path):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    ssh.connect(self.remote_ip, username=self.remote_username,
                key_filename=self.ssh_key_path, port=self.port)
    self.ssh = ssh
    self.ftp = self.ssh.open_sftp()
    self.ftp.get(from_path, to_path)
    ...
```

### 13. Fix bug khi Backup qua SSH phải tạo thư mục với đường là hostname và tên bản backup trước trên Remote Host (VD: `/root/metadata/tar/zabbix_long_ssh`)
*Thiếu đoạn code khởi tạo path*
```
vim /usr/local/lib/python2.7/dist-packages/freezer/storage/physical.py
    def get_level_zero(self,
                       engine,
                       hostname_backup_name,
                       recent_to_date=None):
        path = self.metadata_path(
            engine=engine,
            hostname_backup_name=hostname_backup_name)
        try:
            self.create_dirs(path)
        except:
            pass
```

### 14. Freezer sử dụng thư viện paramiko để giao tiếp SFTP với Remote FS, có thể sử dụng thư viện này thông qua ví dụ sau:
```
    import paramiko
    hostname = '172.16.69.179'
    port = 22
    username = 'root'
    password = 'a'
    t = paramiko.Transport((hostname, port))
    t.connect(username=username, password=password)
    sftp = paramiko.SFTPClient.from_transport(t)
    sftp.mkdir(path)
```

### 15. Fix bug backup sử dụng LVM Snapshot không có nội dung ở branch origin/master
*Do hàm snapshot_create bị lỗi nên không tạo được LVM Snapshot*
```
vim /usr/local/lib/python2.7/dist-packages/freezer/snapshot/snapshot.py
    def snapshot_create(backup_opt_dict):
            if not backup_opt_dict:
                return False
```

```
vim /usr/local/lib/python2.7/dist-packages/freezer/snapshot/lvm.py
    ...
    def lvm_snap(backup_opt_dict):
        backup_opt_dict.path_to_backup = backup_opt_dict.lvm_dirmount 
    ...
    def _umount(path):
        #os.rmdir(path) #Không xóa thư mục mount sau khi backup xong    
```
