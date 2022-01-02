//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var id = params.get("id");
var embedded = params.get("embedded");

var loadedItemDetails;
var timeOutHasExpired = false;

//Show the header to allow the user to close the window even if the item fails to load
document.querySelector("header").classList.remove("hidden");

//Fetch the item details and content
if (id) {
    //Start a timeout
    setTimeout(function () {
        timeOutHasExpired = true;
        if (loadedItemDetails) {
            showItemDetails();
        }
    }, 1000);
    fetch("/api/item/" + id)
    .then(response => response.json())
    .then(checkTimeout, showErrorScreen);
} else {
    showErrorScreen();
}

function checkTimeout(itemDetails) {
    loadedItemDetails = itemDetails;
    if (timeOutHasExpired) {
        showErrorScreen();
    }
}

function showItemDetails() {
    var itemDetails = loadedItemDetails;

    //Show the item details
    document.querySelector(".park").textContent = itemDetails.park;
    document.querySelector(".name").textContent = itemDetails.name;
    document.querySelector(".description").textContent = itemDetails.description;
    var properties = ["author", "date", "type", "format"];
    for (var i in properties) {
        var element = document.createElement("p");
        element.classList.add("property");
        element.textContent = properties[i][0].toUpperCase() + properties[i].slice(1) + ": ";
        var span = document.createElement("span");
        span.textContent = itemDetails[properties[i]];
        element.appendChild(span);
        document.querySelector(".itemInfoContainer").appendChild(element);
    }

    document.querySelector(".contentType").textContent = itemDetails.type;

    requestAnimationFrame(function () {
        document.querySelector(".itemInfoContainer").classList.remove("hidden");
    });

    //Show the item content
    showItemContent(id, itemDetails.type, itemDetails.format);

}

function showItemContent(id, itemType, itemFormat) {
    var contentDisplayElement;
    //Show the item content
    switch (itemType) {
        case "image":
            contentDisplayElement = document.createElement("img");
            contentDisplayElement.src = "/resources/" + id + "/main";
            document.querySelector(".contentDisplay").appendChild(contentDisplayElement);
    
            document.querySelector(".loadingScreen").classList.add("hidden")
            document.querySelector(".contentDisplay").classList.remove("hidden");
            break;
        case "video":
            contentDisplayElement = document.createElement("div");
            contentDisplayElement.id = "player";
            document.querySelector(".contentDisplay").appendChild(contentDisplayElement);

            var scriptElement = document.createElement("script");
            scriptElement.src = "https://www.youtube.com/iframe_api";

            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(scriptElement, firstScriptTag);
            break;
        case "audio":
            document.querySelector(".contentDisplay").innerHTML = `
                <div class="audioControls">
                    <button class="pausePlayButton" onclick="audioPlayer.isPlaying ? audioPlayer.pause() : audioPlayer.play()">
                        <picture class="play">
                            <source srcset="/images/icons/play-white.svg" media="(prefers-color-scheme: dark)">
                            <img src="/images/icons/play-black.svg" alt="Play" width="auto" height="20pt" style="margin-left: 2.5pt">
                        </picture>
                        <picture class="pause">
                            <source srcset="/images/icons/pause-white.svg" media="(prefers-color-scheme: dark)">
                            <img src="/images/icons/pause-black.svg" alt="Pause" width="auto" height="20pt">
                        </picture>
                    </button>
                    <div class="progressBar">
                        <div class="progressBarFill"></div>
                        <input type="range" class="progressBarInput" value="0" oninput="audioPlayer.oninput()" onchange="audioPlayer.onchange(this.value)">
                    </div>
                </div>
            `;

            var playerElement = document.createElement("div");
            playerElement.id = "player";
            playerElement.classList.add("hidden");
            document.querySelector(".contentDisplay").appendChild(playerElement);

            var scriptElement = document.createElement("script");
            scriptElement.src = "https://www.youtube.com/iframe_api";

            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(scriptElement, firstScriptTag);
            break;
        case "date":
            contentDisplayElement = document.createElement("h1");
            var date = new Date(loadedItemDetails.timecode);
            switch (loadedItemDetails.metadata.precision) {
                case "year":
                    contentDisplayElement.textContent = date.getFullYear();
                    break;
                case "month":
                    contentDisplayElement.textContent = date.toLocaleString("en-US", { month: "long" }) + date.getFullYear();
                    break;
                case "day":
                    contentDisplayElement.textContent = date.toLocaleString("en-US", { weekday: "long" }) + ", " + date.toLocaleString("en-US", { month: "long" }) + " " + date.getDate() + ", " + date.getFullYear();
                    break;
                case "hour":
                    contentDisplayElement.textContent = date.toLocaleString("en-US", { weekday: "long" }) + ", " + date.toLocaleString("en-US", { month: "long" }) + " " + date.getDate() + ", " + date.getFullYear() + " at " + date.toLocaleString("en-US", { hour: "numeric", hour12: true });
                    break;
                case "minute":
                    contentDisplayElement.textContent = date.toLocaleString("en-US", { weekday: "long" }) + ", " + date.toLocaleString("en-US", { month: "long" }) + " " + date.getDate() + ", " + date.getFullYear() + " at " + date.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
                    break;
                case "second":
                    contentDisplayElement.textContent = date.toLocaleString("en-US", { weekday: "long" }) + ", " + date.toLocaleString("en-US", { month: "long" }) + " " + date.getDate() + ", " + date.getFullYear() + " at " + date.toLocaleString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true });
                    break;
            }
            document.querySelector(".contentDisplay").appendChild(contentDisplayElement);
            break;
        case "text":
            contentDisplayElement = document.createElement("h2");
            contentDisplayElement.textContent = loadedItemDetails.description;
            document.querySelector(".contentDisplay").appendChild(contentDisplayElement);
            break;
        default:
            contentDisplayElement = document.createElement("div");
    }

    requestAnimationFrame(function () {
        document.querySelector(".contentDisplay").classList.remove("invisible");
    });
}

var audioPlayer = {
    player: undefined,
    refreshInterval: undefined,
    get isPlaying () {
        return this.player.getPlayerState() == 1;
    },
    get length() {
        return this.player.getDuration();
    },
    get currentTime() {
        return this.player.getCurrentTime();
    },

    updatePlayPauseButton: function () {
        if (audioPlayer.isPlaying) {
            document.querySelector(".pausePlayButton").classList.add("playing");
        } else {
            document.querySelector(".pausePlayButton").classList.remove("playing");
        }
    },
    updateProgressBar: function () {
        document.querySelector(".progressBarFill").style.width = (audioPlayer.currentTime / audioPlayer.length) * 100 + "%";
        document.querySelector(".progressBarInput").value = audioPlayer.currentTime;
    },

    oninput: function () {
        if (audioPlayer.refreshInterval) {
            clearInterval(audioPlayer.refreshInterval);
            audioPlayer.refreshInterval = undefined;
        }
    },
    onchange: function (value) {
        audioPlayer.player.seekTo(value, true);
        audioPlayer.updateProgressBar();
        if (audioPlayer.isPlaying) {
            audioPlayer.refreshInterval = setInterval(audioPlayer.updateProgressBar, 500);
        }
    },

    play: function () {
        this.player.playVideo();
        this.isPlaying = true;
    },
    pause: function () {
        this.player.pauseVideo();
        this.isPlaying = false;
    },
    skipTo: function (value, allowSeekAhead) {
        this.player.seekTo(value, allowSeekAhead);
        this.updateProgressBar();
    }
}

//YouTube Embed
function onYouTubeIframeAPIReady() {
    audioPlayer.player = new YT.Player("player", {
        height: "" + (document.documentElement.clientWidth * 9 / 16),
        width: "" + document.documentElement.clientWidth,
        videoId: loadedItemDetails.video_id,
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    document.querySelector(".loadingScreen").classList.add("hidden")
    document.querySelector(".contentDisplay").classList.remove("hidden");
}

function onPlayerReady(event) {
    document.querySelector(".audioControls input").min = audioPlayer.currentTime;
    document.querySelector(".audioControls input").max = audioPlayer.length;
    event.target.playVideo();
}
function onPlayerStateChange(event) {
    audioPlayer.updatePlayPauseButton();
    audioPlayer.updateProgressBar();
    if (audioPlayer.isPlaying) {
        audioPlayer.refreshInterval = setInterval(audioPlayer.updateProgressBar, 500);
    } else {
        clearInterval(audioPlayer.refreshInterval)
    }
}

function showErrorScreen() {
    //Hide the loading screen and show the error screen
    document.querySelector(".loadingScreen").classList.add("hidden")
    document.querySelector(".errorScreen").classList.remove("hidden");
}

function closeItemDetails() {
    if (audioPlayer.player) {
        audioPlayer.player.stopVideo();
    }
    window.top.postMessage("closeDetails", "*");
}