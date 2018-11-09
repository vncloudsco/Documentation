### Jekyll Image Encode
```sh
<img src="{% base64 http://example.org/image.png %}" />
```
### Image thumbnailing plugin for Jekyll / octopress
```sh
{% thumbnail /path/to/local/image.png 50x50< %}
```
### jekyll-soundcloud

A Jekyll plug-in for embedding SoundCloud sounds in your Liquid templates.
```sh
Usage:
{% soundcloud_sound 12345 %}
{% soundcloud_sound 12345 widgetname %}
{% soundcloud_sound 12345 widgetname ffffff %}
{% soundcloud_sound 12345 widgetname ffffff small %}
```
### đăng video lên blog
Khuyến cào mọi người dùng hls.js để mọi người có thể xem video một các tốt nhất
để đăng video dùng đoạn code sau:
```sh
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<!-- Or if you want a more recent canary version -->
<!-- <script src="https://cdn.jsdelivr.net/npm/hls.js@canary"></script> -->
<video id="video" style="width: 720px; height: 600px" controls></video>
<script>
  var video = document.getElementById('video');
  if(Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
      video.play();
  });
 }
 // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
 // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
 // This is using the built-in support of the plain video element, without using hls.js.
 // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
 // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
    video.addEventListener('loadedmetadata',function() {
      video.play();
    });
  }
</script>

```

chú ý thay link https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8 thành link video khuyến khích upload lên github để có tốc độ cao
