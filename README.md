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
