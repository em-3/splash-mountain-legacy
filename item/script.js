//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var id = params.get("id");
var embedded = params.get("embedded");
if(!id) {
  //Extract the ID from the last part of the URL
  var pieces = url.pathname.split("/");
  id = pieces[pieces.length - 2];
}

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
    .then((response) => response.json())
    .then(checkTimeout, showErrorScreen);
} else {
  showErrorScreen();
}

function checkTimeout(itemDetails) {
  loadedItemDetails = itemDetails;
  if (timeOutHasExpired) {
    showItemDetails();
  }
}

function showItemDetails() {
  var itemDetails = loadedItemDetails;
  var metadata = JSON.parse(loadedItemDetails.metadata);

  function createDetailProperty(label, value, link) {
    var element = document.createElement("p");
    element.classList.add("property");
    element.textContent = label + ": ";
    var span = document.createElement("span");
    span.textContent = value;
    if (link) {
      var a = document.createElement("a");
      a.href = link;
      a.target = "_blank";
      a.appendChild(span);
      element.appendChild(a);
    } else {
      element.appendChild(span);
    }
    document
      .querySelector(".itemInfoContainer")
      .insertBefore(
        element,
        document.querySelector(".itemInfoContainer .metadata")
      );
  }

  //Show the item details
  document.querySelector(".park").textContent = itemDetails.park;
  document.querySelector(".name").textContent = itemDetails.name;
  if (itemDetails.type !== "text") {
    var descriptionElement = document.createElement("p");
    descriptionElement.classList.add("description");
    descriptionElement.textContent = itemDetails.description;
    document
      .querySelector(".itemInfoContainer")
      .insertBefore(
        descriptionElement,
        document.querySelector(".itemInfoContainer .metadata")
      );
  }
  if (itemDetails.author) {
    if (itemDetails.author.match(/\[([^\][]+)]/g)) {
      createDetailProperty(
        "Author",
        itemDetails.author.replace(/\[([^\][]+)]/g, ""),
        itemDetails.author
          .match(/\[([^\][]+)]/g)[0]
          .substring(1, itemDetails.author.match(/\[([^\][]+)]/g)[0].length - 1)
      );
    } else {
      createDetailProperty("Author", itemDetails.author);
    }
  }
  if (itemDetails.timestamp && itemDetails.type !== "date") {
    var dateObject = new Date(itemDetails.timestamp.replace(" ", "T"));

    var timestampValue = "";
    switch (metadata.precision) {
      case "year":
        timestampValue = dateObject.toLocaleDateString("en-US", {
          year: "numeric",
        });
        break;
      case "month":
        timestampValue = dateObject.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
        break;
      case "day":
        timestampValue = dateObject.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        break;
      case "hour":
        timestampValue = dateObject.toLocaleTimeString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
        });
        break;
      case "minute":
        timestampValue = dateObject.toLocaleTimeString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
        break;
    }

    createDetailProperty("Timestamp", timestampValue);
  }
  if (metadata && metadata.make && metadata.model) {
    document.querySelector(".metadata .header .make").textContent =
      metadata.make;
    document.querySelector(".metadata .header .model").textContent =
      metadata.model;

    if (metadata.software) {
      var versionElement = document.querySelector(".metadata .header .version");
      versionElement.textContent = metadata.software;
      versionElement.classList.remove("hidden");
    }

    function createContentPropertyElement(value) {
      var element = document.createElement("p");
      element.textContent = value;
      document.querySelector(".metadata .content").appendChild(element);
    }
    if (metadata.focalLength) {
      createContentPropertyElement(metadata.focalLength + "mm");
    }
    if (metadata.fNumber) {
      createContentPropertyElement("ƒ" + metadata.fNumber);
    }
    if (metadata.exposureTime) {
      createContentPropertyElement(metadata.exposureTime);
    }
    if (metadata.colorSpace) {
      createContentPropertyElement(metadata.colorSpace);
    }

    document.querySelector(".metadata").classList.remove("hidden");
  }

  requestAnimationFrame(function () {
    document.querySelector(".itemInfoContainer").classList.remove("hidden");
  });

  //Show the item content
  showItemContent(itemDetails);
}

function showItemContent(itemDetails) {
  var itemType = itemDetails.type;
  var itemFormat = itemDetails.format;
  //Show the item content
  switch (itemType) {
    case "image":
      var thumbnailElement = document.createElement("img");
      thumbnailElement.classList.add("thumbnail");
      thumbnailElement.src = "/resources/" + itemDetails.image + "/thumbnail";
      document.querySelector(".contentDisplay").appendChild(thumbnailElement);

      var loadingContainer = document.createElement("div");
      loadingContainer.classList.add("loadingContainer");

      var loadingAnimationContainer = document.createElement("div");
      loadingAnimationContainer.classList.add("loadingAnimationContainer");
      loadingAnimationContainer.innerHTML = `
                <div class="loadingAnimationEllipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;

      var loadingText = document.createElement("p");
      loadingText.classList.add("loadingText");
      loadingText.textContent = "Loading Full Image";

      loadingContainer.appendChild(loadingAnimationContainer);
      loadingContainer.appendChild(loadingText);
      document.querySelector(".contentDisplay").appendChild(loadingContainer);

      var contentDisplayElement = document.createElement("img");
      contentDisplayElement.classList.add("main");
      contentDisplayElement.classList.add("hidden");
      contentDisplayElement.onload = function () {
        document
          .querySelector(".contentDisplay .thumbnail")
          .classList.add("hidden");
        document
          .querySelector(".contentDisplay .loadingContainer")
          .classList.add("hidden");
        document
          .querySelector(".contentDisplay .main")
          .classList.remove("hidden");
      };
      contentDisplayElement.src = "/resources/" + itemDetails.image + "/main";
      document
        .querySelector(".contentDisplay")
        .appendChild(contentDisplayElement);

      document.querySelector(".loadingScreen").classList.add("hidden");
      document.querySelector(".contentDisplay").classList.remove("hidden");
      break;
    case "video":
      var contentDisplayElementContainer = document.createElement("div");
      contentDisplayElementContainer.classList.add("videoContainer");

      var contentDisplayElement = document.createElement("div");
      contentDisplayElement.id = "player";

      contentDisplayElementContainer.appendChild(contentDisplayElement);
      document
        .querySelector(".contentDisplay")
        .appendChild(contentDisplayElementContainer);

      var scriptElement = document.createElement("script");
      scriptElement.src = "https://www.youtube.com/iframe_api";

      var firstScriptTag = document.getElementsByTagName("script")[0];
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

      var firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(scriptElement, firstScriptTag);
      break;
    case "date":
      var contentDisplayElement = document.createElement("h1");
      var date = new Date(loadedItemDetails.timestamp.replace(" ", "T"));

      switch (JSON.parse(loadedItemDetails.metadata).precision) {
        case "year":
          contentDisplayElement.textContent = date.getFullYear();
          break;
        case "month":
          contentDisplayElement.textContent =
            date.toLocaleString("en-US", { month: "long" }) +
            date.getFullYear();
          break;
        case "day":
          contentDisplayElement.textContent =
            date.toLocaleString("en-US", { weekday: "long" }) +
            ", " +
            date.toLocaleString("en-US", { month: "long" }) +
            " " +
            date.getDate() +
            ", " +
            date.getFullYear();
          break;
        case "hour":
          contentDisplayElement.textContent =
            date.toLocaleString("en-US", { weekday: "long" }) +
            ", " +
            date.toLocaleString("en-US", { month: "long" }) +
            " " +
            date.getDate() +
            ", " +
            date.getFullYear() +
            " at " +
            date.toLocaleString("en-US", { hour: "numeric", hour12: true });
          break;
        case "minute":
          contentDisplayElement.textContent =
            date.toLocaleString("en-US", { weekday: "long" }) +
            ", " +
            date.toLocaleString("en-US", { month: "long" }) +
            " " +
            date.getDate() +
            ", " +
            date.getFullYear() +
            " at " +
            date.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });
          break;
      }
      document
        .querySelector(".contentDisplay")
        .appendChild(contentDisplayElement);
      document.querySelector(".loadingScreen").classList.add("hidden");
      document.querySelector(".contentDisplay").classList.remove("hidden");
      break;
    case "text":
      var contentDisplayElement = document.createElement("h2");
      contentDisplayElement.textContent = loadedItemDetails.description;
      document
        .querySelector(".contentDisplay")
        .appendChild(contentDisplayElement);
      document.querySelector(".loadingScreen").classList.add("hidden");
      document.querySelector(".contentDisplay").classList.remove("hidden");
      break;
  }

  requestAnimationFrame(function () {
    document.querySelector(".contentDisplay").classList.remove("invisible");
  });
}

function share() {
  if (navigator.share) {
    navigator.share({
      title: loadedItemDetails.name,
      url: "https://splashmountainlegacy.com/item/" + loadedItemDetails.id,
    });
  } else {
    navigator.clipboard.writeText(
      "https://splashmountainlegacy.com/item/" + loadedItemDetails.id
    );
    document.querySelector(".shareButton").textContent = "Copied Link";
  }
}

var audioPlayer = {
  player: undefined,
  refreshInterval: undefined,
  get isPlaying() {
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
    document.querySelector(".progressBarFill").style.width =
      (audioPlayer.currentTime / audioPlayer.length) * 100 + "%";
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
      audioPlayer.refreshInterval = setInterval(
        audioPlayer.updateProgressBar,
        500
      );
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
  },
};

//YouTube Embed
function onYouTubeIframeAPIReady() {
  audioPlayer.player = new YT.Player("player", {
    height: "" + (document.documentElement.clientWidth * 9) / 16,
    width: "" + document.documentElement.clientWidth,
    videoId: loadedItemDetails.video_id,
    playerVars: {
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
  document.querySelector(".loadingScreen").classList.add("hidden");
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
    audioPlayer.refreshInterval = setInterval(
      audioPlayer.updateProgressBar,
      500
    );
  } else {
    clearInterval(audioPlayer.refreshInterval);
  }
}

function showErrorScreen() {
  //Hide the loading screen and show the error screen
  document.querySelector(".loadingScreen").classList.add("hidden");
  document.querySelector(".errorScreen").classList.remove("hidden");
}

function closeItemDetails() {
  if (audioPlayer.player) {
    audioPlayer.player.stopVideo();
  }
  if (embedded) {
    window.top.postMessage("closeDetails", "*");
  } else {
    window.location.href = "/";
  }
}
