//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var id = params.get("id");
var embedded = params.get("embedded");
if (!id) {
	//Extract the ID from the last part of the URL
	var pieces = url.pathname.split("/");
	id = pieces[pieces.length - 2];
}

var loadedItemDetails;
var timeOutHasExpired = false;

//If the user is authenticated, show the admin buttons
if (localStorage.getItem("adminAccess") === "true") {
	document.querySelector(".buttonContainer .editItem").classList.remove("hidden");
}

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

	function createDetailProperty(icon, value, action) {
		var containerElement = document.createElement("div");
		containerElement.classList.add("property");

		var iconContainer = document.createElement("div");
		iconContainer.classList.add("iconContainer");

		var iconElement = document.createElement("i");
		iconElement.classList.add("gg-" + icon);

		var valueElement = document.createElement("p");
		valueElement.textContent = value;
		if (action) {
			valueElement.classList.add("button");
			valueElement.onclick = action;
		}

		iconContainer.appendChild(iconElement);
		containerElement.appendChild(iconContainer);
		containerElement.appendChild(valueElement);
		document.querySelector(".propertiesContainer").appendChild(containerElement);
	}

	//Show the item details
	document.querySelector(".park").textContent = itemDetails.park;
	document.querySelector(".scene").textContent = itemDetails.scene;
	document.querySelector(".name").textContent = itemDetails.name;
	if (itemDetails.type !== "text") {
		var descriptionElement = document.createElement("p");
		descriptionElement.classList.add("description");
		descriptionElement.textContent = itemDetails.description;
		document
			.querySelector(".itemInfoContainer")
			.insertBefore(
				descriptionElement,
				document.querySelector(".itemInfoContainer .propertiesContainer")
			);
	}
	switch (itemDetails.type) {
		case "image":
			createDetailProperty("image", "Image");
			break;
		case "video":
			createDetailProperty("film", "Video");
			break;
		case "audio":
			createDetailProperty("headset", "Audio");
			break;
		case "text":
			createDetailProperty("file-document", "Text");
			break;
		case "date":
			createDetailProperty("calendar-dates", "Date");
			break;
	}
	if (itemDetails.author) {
		if (itemDetails.author.match(/\[([^\][]+)]/g)) {
			var author = itemDetails.author.replace(/\[([^\][]+)]/g, "");
			var link = itemDetails.author
					.match(/\[([^\][]+)]/g)[0]
					.substring(
						1,
						itemDetails.author.match(/\[([^\][]+)]/g)[0].length - 1
					)
			createDetailProperty(
				"user",
				author,
				function (e) {
					contextMenu.present({
						x: e.clientX,
						y: e.clientY,
						items: [
							{
								icon: "profile",
								label: "See All Items",
								callback: function () {
									if (embedded) {
										window.top.postMessage(
											"navigateTo/database/?author=" + author,
											"*"
										);
									} else {
										window.location.href = "/database/?author=" + author;
									}
								}
							},
							{
								icon: "external",
								label: "Open Link",
								callback: function () {
									window.open(link);
								}
							}
						]
					});
				}
			);
		} else {
			createDetailProperty(
				"user",
				itemDetails.author,
				function (e) {
					contextMenu.present({
						x: e.clientX,
						y: e.clientY,
						items: [
							{
								icon: "profile",
								label: "See All Items",
								callback: function () {
									if (embedded) {
										window.top.postMessage(
											"navigateTo/database/?author=" + itemDetails.author,
											"*"
										);
									} else {
										window.location.href = "/database/?author=" + itemDetails.author;
									}
								}
							}
						]
					});
				}
			);
		}
	}
	if (itemDetails.timestamp && itemDetails.type !== "date") {
		var dateObject = new Date(itemDetails.timestamp.replace(" ", "T"));

		var dateValue;
		switch (metadata.precision) {
			case "year":
				dateValue = dateObject.toLocaleDateString("en-US", {
					year: "numeric",
				});
				break;
			case "month":
				dateValue = dateObject.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
				});
				break;
			case "day":
			case "hour":
			case "minute":
				dateValue = dateObject.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
				break;
		}

		var timeValue;
		switch (metadata.precision) {
			case "hour":
				timeValue = dateObject.toLocaleTimeString("en-US", {
					hour: "numeric",
				});
				break;
			case "minute":
				timeValue = dateObject.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "numeric",
				});
				break;
		}


		createDetailProperty("calendar-today", dateValue);
		if (timeValue) {
			createDetailProperty("time", timeValue);
		}
	}

	//If admin, display item ID and other IDs
	if (localStorage.getItem("adminAccess") === "true") {
		//Item ID
		createDetailProperty("key", itemDetails.id, function (e) {
			contextMenu.present({
				x: e.clientX,
				y: e.clientY,
				items: [
					{
						icon: "copy",
						label: "Copy Item ID",
						callback: function () {
							navigator.clipboard.writeText(itemDetails.id);
							notification.addToQueue("progress", "copy", "Copied", "Item ID copied to clipboard.");
						}
					}
				]
			});
		});

		if (itemDetails.type === "image") {
			//Resource ID
			createDetailProperty("image", itemDetails.image, function (e) {
				contextMenu.present({
					x: e.clientX,
					y: e.clientY,
					items: [
						{
							icon: "copy",
							label: "Copy Resource ID",
							callback: function () {
								navigator.clipboard.writeText(itemDetails.image);
								notification.addToQueue("progress", "copy", "Copied", "Resource ID copied to clipboard.");
							}
						},
						{
							icon: "copy",
							label: "Copy Thumbnail URL",
							callback: function () {
								navigator.clipboard.writeText(
									"https://splashmountainlegacy.com/resources/" + itemDetails.image + "/thumbnail.jpg"
								);
								notification.addToQueue("progress", "copy", "Copied", "Thumbnail URL copied to clipboard.");
							}
						},
						{
							icon: "copy",
							label: "Copy Full Image URL",
							callback: function () {
								navigator.clipboard.writeText(
									"https://splashmountainlegacy.com/resources/" + itemDetails.image + "/main.jpg"
								);
								notification.addToQueue("progress", "copy", "Copied", "Full Image URL copied to clipboard.");
							}
						}
					]
				});
			});
		} else if (itemDetails.type === "video" || itemDetails.type === "audio") {
			//YouTube ID
			createDetailProperty("film", itemDetails.video_id, function (e) {
				contextMenu.present({
					x: e.clientX,
					y: e.clientY,
					items: [
						{
							icon: "copy",
							label: "Copy YouTube ID",
							callback: function () {
								navigator.clipboard.writeText(itemDetails.video_id);
								notification.addToQueue("progress", "copy", "Copied", "YouTube ID copied to clipboard.");
							}
						},
						{
							icon: "copy",
							label: "Copy YouTube URL",
							callback: function () {
								navigator.clipboard.writeText(
									"https://www.youtube.com/watch?v=" + itemDetails.video_id
								);
								notification.addToQueue("progress", "copy", "Copied", "YouTube URL copied to clipboard.");
							}
						},
						{
							icon: "copy",
							label: "Copy Thumbnail URL",
							callback: function () {
								navigator.clipboard.writeText(
									"https://img.youtube.com/vi/" + itemDetails.video_id + "/hqdefault.jpg"
								);
								notification.addToQueue("progress", "copy", "Copied", "Thumbnail URL copied to clipboard.");
							}
						}
					]
				});
			});
		}
	}

	if (itemDetails.tags) {
		var tags = itemDetails.tags.split(",");
		for (var i = 0; i < tags.length; i++) {
			var tag = tags[i];
			var tagElement = document.createElement("p");
			tagElement.classList.add("tag");
			tagElement.textContent = tag;
			(function (tag) {
				tagElement.onclick = function (e) {
					contextMenu.present({
						x: e.clientX,
						y: e.clientY,
						items: [
							{
								icon: "tag",
								label: "See All Items",
								callback: function () {
									if (embedded) {
										window.top.postMessage(
											"navigateTo/database/?tag=" + tag,
											"*"
										);
									} else {
										window.location.href = "/database/?tag=" + tag;
									}
								}
							}
						]
					});
				};
			})(tag);
			document
				.querySelector(".itemInfoContainer .tags")
				.appendChild(tagElement);
		}
		if (localStorage.getItem("adminAccess") === "true") {
			document
				.querySelector(".itemInfoContainer .tags")
				.classList.remove("hidden");
		}
	}
	if (metadata && metadata.make && metadata.model) {
		document.querySelector(".metadata .header .make").textContent =
			metadata.make;
		document.querySelector(".metadata .header .model").textContent =
			metadata.model;

		if (metadata.software) {
			var versionElement = document.querySelector(
				".metadata .header .version"
			);
			versionElement.textContent = metadata.software;
			versionElement.classList.remove("hidden");
		}

		function createContentPropertyElement(icon, name, value) {
			var containerElement = document.createElement("div");
			var iconElement = document.createElement("i");
			var valueElement = document.createElement("p");

			containerElement.title = name;
			iconElement.classList.add("gg-" + icon);
			valueElement.textContent = value;

			containerElement.appendChild(iconElement);
			containerElement.appendChild(valueElement);
			document.querySelector(".metadata .content").appendChild(containerElement);
		}
		if (metadata.focalLength) {
			createContentPropertyElement("edit-black-point", "Focal Length", metadata.focalLength + "mm");
		}
		if (metadata.fNumber) {
			createContentPropertyElement("edit-exposure", "F-Number", "ƒ" + metadata.fNumber);
		}
		if (metadata.exposureTime) {
			createContentPropertyElement("timelapse", "Exposure Time", metadata.exposureTime);
		}
		if (metadata.colorSpace) {
			createContentPropertyElement("color-picker", "Color Space", metadata.colorSpace);
		}
		if (metadata.flash) {
			if (metadata.flash.indexOf("did fire") !== -1) {
				createContentPropertyElement("bulb", "Flash", "Flash");
			} else {
				createContentPropertyElement("bulb", "Flash", "No Flash");
			}
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
			thumbnailElement.src = "/resources/" + itemDetails.image + "/thumbnail.jpg";
			document.querySelector(".contentDisplay").appendChild(thumbnailElement);

			var loadingContainer = document.createElement("div");
			loadingContainer.classList.add("loadingContainer");

			var loadingAnimationContainer = document.createElement("div");
			loadingAnimationContainer.classList.add(
				"loadingAnimationContainer"
			);
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
			document
				.querySelector(".contentDisplay")
				.appendChild(loadingContainer);

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
			contentDisplayElement.src = "/resources/" + itemDetails.image + "/main.jpg";
			document.querySelector(".contentDisplay").appendChild(contentDisplayElement);

			document.querySelector(".loadingScreen").classList.add("hidden");
			document
				.querySelector(".contentDisplay")
				.classList.remove("hidden");
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
			firstScriptTag.parentNode.insertBefore(
				scriptElement,
				firstScriptTag
			);
			break;
		case "audio":
			document.querySelector(".contentDisplay").innerHTML = `
                <div class="audioControls">
                    <div class="info">
						<div class="left">
							<button class="playStateButton" onclick="audioPlayer.changePlayState()">
								<i class="play gg-play-button hidden"></i>
								<i class="pause gg-play-pause hidden"></i>
								<i class="replay gg-undo hidden"></i>
								<div class="buffering loadingContainer">
									<div class="loadingAnimationEllipsis">
										<div></div>
										<div></div>
										<div></div>
										<div></div>
									</div>
								</div>
							</button>
							<button class="repeatButton" onclick="audioPlayer.changeRepeatMode()">
								<i class="gg-repeat"></i>
							</button>
						</div>
						<div class="right">
							<p class="time">
								<span class="currentTime">0:00</span> / <span class="duration">0:00</span>
							</p>
						</div>
					</div>
                    <div class="progressBar">
                        <div class="barWrapper">
							<div class="buffered"></div>
							<div class="progress"></div>
						</div>
                        <input type="range" class="progressBarInput" value="0" oninput="audioPlayer.oninput(this.value)" onchange="audioPlayer.onchange(this.value)">
                    </div>
                </div>
            `;

			var playerElement = document.createElement("div");
			playerElement.id = "player";
			playerElement.classList.add("hidden");
			document
				.querySelector(".contentDisplay")
				.appendChild(playerElement);

			var scriptElement = document.createElement("script");
			scriptElement.src = "https://www.youtube.com/iframe_api";

			var firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(
				scriptElement,
				firstScriptTag
			);
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
						" " +
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
						date.toLocaleString("en-US", {
							hour: "numeric",
							hour12: true,
						});
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
			document
				.querySelector(".contentDisplay")
				.classList.remove("hidden");
			break;
		case "text":
			var contentDisplayElement = document.createElement("h2");
			contentDisplayElement.textContent = loadedItemDetails.description;
			document
				.querySelector(".contentDisplay")
				.appendChild(contentDisplayElement);
			document.querySelector(".loadingScreen").classList.add("hidden");
			document
				.querySelector(".contentDisplay")
				.classList.remove("hidden");
			break;
	}

	requestAnimationFrame(function () {
		document.querySelector(".contentDisplay").classList.remove("invisible");
		setTimeout(function () {
			//If the item is a video or image...
			if (itemType == "video"|| itemType == "image") {
				checkAutohide();
				window.addEventListener("resize", checkAutohide);
			}
		}, 200);
	});
}

function share(e) {
	if (navigator.share) {
		contextMenu.present({
			x: e.clientX,
			y: e.clientY,
			items: [
				{
					icon: "link",
					label: "Copy Link",
					callback: function () {
						navigator.clipboard.writeText(
							"https://splashmountainlegacy.com/item/" + loadedItemDetails.id
						);
						notification.addToQueue("progress", "link", "Copied", "Link copied to clipboard.")
					}
				},
				{
					icon: "share",
					label: "Share Link",
					callback: function () {
						navigator.share({
							title: loadedItemDetails.name,
							url: window.location.href
						});
					}
				}
			]
		});
	} else {
		navigator.clipboard.writeText(
			"https://splashmountainlegacy.com/item/" + loadedItemDetails.id
		);
		document.querySelector(".shareButton").textContent = "Copied Link";
	}
}

function editItem() {
	window.location.href =
		"/admin/embeds/databaseItemEditor/?mode=editor&fromViewer=true&id=" +
		loadedItemDetails.id;
}

var audioPlayer = {
	player: undefined,
	refreshInterval: undefined,
	loop: false,

	get playingState() {
		switch (this.player.getPlayerState()) {
			case YT.PlayerState.PLAYING:
				return "playing";
			case YT.PlayerState.PAUSED:
				return "paused";
			case YT.PlayerState.BUFFERING:
				return "buffering";
			case YT.PlayerState.CUED:
				return "cued";
			case YT.PlayerState.ENDED:
				return "ended";
		}
	},
	get length() {
		return this.player.getDuration();
	},
	get currentTime() {
		return this.player.getCurrentTime();
	},
	get bufferedFraction() {
		return this.player.getVideoLoadedFraction();
	},

	formatTime: function (time) {
		var minutes = Math.floor(time / 60);
		var seconds = Math.floor(time - minutes * 60);
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		return minutes + ":" + seconds;
	},

	changePlayState: function () {
		if (this.playingState === "playing") {
			this.player.pauseVideo();
		} else {
			this.player.playVideo();
		}
	},
	changeRepeatMode: function () {
		this.loop = !this.loop;
		this.elements.repeatButton.classList.toggle("active");
	},

	updatePlayStateButton: function () {
		audioPlayer.elements.playStateButton.play.classList.add("hidden");
		audioPlayer.elements.playStateButton.pause.classList.add("hidden");
		audioPlayer.elements.playStateButton.buffering.classList.add("hidden");
		audioPlayer.elements.playStateButton.replay.classList.add("hidden");

		if (audioPlayer.playingState === "playing") {
			audioPlayer.elements.playStateButton.pause.classList.remove("hidden");
		} else if (audioPlayer.playingState === "paused") {
			audioPlayer.elements.playStateButton.play.classList.remove("hidden");
		} else if (audioPlayer.playingState === "ended") {
			audioPlayer.elements.playStateButton.replay.classList.remove("hidden");
		} else {
			audioPlayer.elements.playStateButton.buffering.classList.remove("hidden");
		}
	},
	updateProgressBar: function (value) {
		audioPlayer.elements.time.current.textContent = audioPlayer.formatTime((value ? value : audioPlayer.currentTime));
		if (value) {
			document.querySelector(".progress").style.width =
				(value / audioPlayer.length) * 100 + "%";
		} else {
			document.querySelector(".progress").style.width =
				(audioPlayer.currentTime / audioPlayer.length) * 100 + "%";
		}
		document.querySelector(".buffered").style.width =
			audioPlayer.bufferedFraction * 100 + "%";
		if (!value) {
			document.querySelector(".progressBarInput").value =
				audioPlayer.currentTime;
		}
	},

	oninput: function (value) {
		if (audioPlayer.refreshInterval) {
			clearInterval(audioPlayer.refreshInterval);
			audioPlayer.refreshInterval = undefined;
		}
		audioPlayer.updateProgressBar(value);
	},
	onchange: function (value) {
		audioPlayer.player.seekTo(value, true);
		audioPlayer.updateProgressBar();
		if (audioPlayer.playingState === "playing" || audioPlayer.playingState === "buffering") {
			audioPlayer.refreshInterval = setInterval(
				audioPlayer.updateProgressBar,
				100
			);
		}
	},
	onPlayerReady: function (event) {
		document.querySelector(".audioControls input").min = audioPlayer.currentTime;
		document.querySelector(".audioControls input").max = audioPlayer.length;
		event.target.playVideo();
		audioPlayer.elements.time.duration.textContent = audioPlayer.formatTime(audioPlayer.length);
	},
	onPlayerStateChange: function (event) {
		audioPlayer.updatePlayStateButton();
		audioPlayer.updateProgressBar();
		if (audioPlayer.playingState === "playing" || audioPlayer.playingState === "buffering") {
			if (audioPlayer.refreshInterval) {
				clearInterval(audioPlayer.refreshInterval);
				audioPlayer.refreshInterval = undefined;
			}
			audioPlayer.refreshInterval = setInterval(
				audioPlayer.updateProgressBar,
				100
			);
		} else if (audioPlayer.playingState === "ended") {
			if (audioPlayer.loop === true) {
				audioPlayer.player.seekTo(0, true);
				audioPlayer.player.playVideo();
			} else {
				clearInterval(audioPlayer.refreshInterval);
				audioPlayer.refreshInterval = undefined;
			}
		} else {
			clearInterval(audioPlayer.refreshInterval);
			audioPlayer.refreshInterval = undefined;
		}
	},

	play: function () {
		this.player.playVideo();
	},
	pause: function () {
		this.player.pauseVideo();
	},
	skipTo: function (value, allowSeekAhead) {
		this.player.seekTo(value, allowSeekAhead);
		this.updateProgressBar();
	},
};

//YouTube Embed
function onYouTubeIframeAPIReady() {
	audioPlayer.elements = {
		playStateButton: {
			element: document.querySelector(".playStateButton"),
			play: document.querySelector(".playStateButton .play"),
			pause: document.querySelector(".playStateButton .pause"),
			buffering: document.querySelector(".playStateButton .buffering"),
			replay: document.querySelector(".playStateButton .replay"),
		},
		repeatButton: document.querySelector(".repeatButton"),
		time: {
			current: document.querySelector(".currentTime"),
			duration: document.querySelector(".duration"),
		}
	}
	audioPlayer.player = new YT.Player("player", {
		height: "" + (document.documentElement.clientWidth * 9) / 16,
		width: "" + document.documentElement.clientWidth,
		videoId: loadedItemDetails.video_id,
		playerVars: {
			playsinline: 1,
			vq: "tiny",
		},
		events: {
			onReady: audioPlayer.onPlayerReady,
			onStateChange: audioPlayer.onPlayerStateChange,
		},
	});
	document.querySelector(".loadingScreen").classList.add("hidden");
	document.querySelector(".contentDisplay").classList.remove("hidden");
}

function showErrorScreen() {
	//Hide the loading screen and show the error screen
	document.querySelector(".loadingScreen").classList.add("hidden");
	document.querySelector(".errorScreen").classList.remove("hidden");
}

function getRenderedSize(contains, cWidth, cHeight, width, height, pos){
	var oRatio = width / height,
		cRatio = cWidth / cHeight;
	return function() {
		if (contains ? (oRatio > cRatio) : (oRatio < cRatio)) {
			this.width = cWidth;
			this.height = cWidth / oRatio;
		} else {
			this.width = cHeight * oRatio;
			this.height = cHeight;
		}      
		this.left = (cWidth - this.width)*(pos/100);
		this.right = this.width + this.left;
		return this;
	}.call({});
}

function checkAutohide() {
	//Check to see if the close button overlaps the content
	var closeButtonRect = document.querySelector(".closeButton").getBoundingClientRect();
	if (loadedItemDetails.type == "image") {
		var contentElement = document.querySelector(".contentDisplay .main");
		var contentRect = contentElement.getBoundingClientRect();
		var renderedSize = getRenderedSize(
			true,
			contentElement.width,
			contentElement.height,
			contentElement.naturalWidth,
			contentElement.naturalHeight,
			parseInt(window.getComputedStyle(contentElement).getPropertyValue('object-position').split(' ')[0])
		);
		contentRect = {
			top: (contentRect.bottom - renderedSize.height)/2,
		}
	} else {
		var contentRect = document.querySelector(".videoContainer").getBoundingClientRect();
	}

	if (closeButtonRect.bottom > contentRect.top) {
		autohideCloseButton(true);
	} else {
		autohideCloseButton(false);
	}
}

var closeButton = document.querySelector(".closeButton");
var mousemoveTimeout = null;

function mousemove() {
	if (mousemoveTimeout) {
		clearTimeout(mousemoveTimeout);
	}
	closeButton.classList.remove("hidden");
	mousemoveTimeout = setTimeout(function () {
		document.querySelector(".closeButton").classList.add("hidden");
	}, 2000);
}

function autohideCloseButton(enable) {
	if (enable) {
		//Show the close button when the user moves the cursor
		document.onmousemove = mousemove;
	} else {
		//Always show the close button
		document.onmousemove = null;
		document.querySelector(".closeButton").classList.remove("hidden");
		if (mousemoveTimeout) {
			clearTimeout(mousemoveTimeout);
		}
	}
}

function closeItemViewer() {
	if (audioPlayer.player) {
		audioPlayer.player.stopVideo();
	}
	if (embedded) {
		window.top.postMessage("closeDetails", "*");
	} else {
		window.location.href = "/";
	}
}
