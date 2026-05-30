(function () {
    window.initMoviePlayer = function (videoId, coverId, streamUrl) {
        const video = document.getElementById(videoId);
        const cover = document.getElementById(coverId);
        let attached = false;
        let hls = null;

        if (!video || !cover || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function beginPlay() {
            attachStream();
            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        cover.addEventListener("click", beginPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                beginPlay();
            }
        });
        video.addEventListener("ended", function () {
            if (hls) {
                hls.stopLoad();
            }
        });
    };
})();
