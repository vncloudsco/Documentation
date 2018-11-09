/* global event listeners for demo purposes, omit in production */
flowplayer(function (api, root) {
  var instanceId = root.getAttribute("data-flowplayer-instance-id"),
      engineInfo = document.getElementById("engine" + instanceId),
      vtypeInfo = document.getElementById("vtype" + instanceId),
      detail = document.getElementById("detail" + instanceId);

  api.on("ready", function (e, api, video) {
    var engineName = api.engine.engineName;

    engineInfo.innerHTML = engineName;
    vtypeInfo.innerHTML = video.type;
    if (engineName === "flash") {
      detail.innerHTML = "video source: " + video.src;
    }

  }).on("progress", function (e, api) {
    var hlsengine = api.engine.hlsjs,
        vtag = api.engine.engineName === "html5" && root.querySelector(".fp-engine");

    if (hlsengine) {
      var current = hlsengine.currentLevel,
          level = hlsengine.levels[current],
          info;

      if (level) {
        info = api.conf.clip.live
            ? level.bitrate / 1000 + " kbps"
            : level.height + "p";

        detail.innerHTML = "HLS level " + (current > -1
            ? current + ": " + info
            : "");
      }

    } else if (vtag) {
      // native playback, less informative
      detail.innerHTML = "Resolution: " + vtag.videoWidth + "x" + vtag.videoHeight;
    }
  });

});
/* end global event listeners setup */


window.onload = function () {

  flowplayer("#hlsjsvod", {
    splash: true,
    aspectRatio: "16:9",

    clip: {
      // enable hlsjs in desktop Safari for manual quality selection
      // CAVEAT: may cause decoding problems with some streams!
      hlsjs: {
        safari: true
      },

      sources: [
        { type: "application/x-mpegurl",
          src:  "//edge.flowplayer.org/cilla_black_bean_sauce.m3u8" },
        { type: "video/mp4",
          src:  "//edge.flowplayer.org/cilla_black_bean_sauce.mp4" }
      ]
    }

  });


  flowplayer("#hlsjslive", {
    splash: true,
    ratio: 9/16,

    // stream only available via https:
    // force loading of Flash HLS via https
    swfHls: "https://releases.flowplayer.org/7.2.4/flowplayerhls.swf",

    clip: {
      // enable hlsjs in desktop Safari for manual quality selection
      // CAVEAT: may cause decoding problems with some streams!
      hlsjs: {
        safari: true
      },
      live: true,
      sources: [
        { type: "application/x-mpegurl",
          src: "https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-Public/master.m3u8" }
      ]
    }

  });

};