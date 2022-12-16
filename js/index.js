//Load attraction wait times
function fetchWaitTime(park, url) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then((response) => response.json())
			.then(
				(data) => {
					var waitTime;
					var operatingStatus = data.liveData[0].status;
					switch (operatingStatus) {
						case "OPERATING":
							operatingStatus = "Operating";
							waitTime = data.liveData[0].queue.STANDBY.waitTime + "min";
							break;
						case "DOWN":
							operatingStatus = "Temporarily Closed";
							waitTime = "Down";
							break;
						case "CLOSED":
							operatingStatus = "Park Closed";
							waitTime = "Closed";
							break;
						case "REFURBISHMENT":
							operatingStatus = "For Refurbishment";
							waitTime = "Closed";
							break;
					}

					var updatedTime = "Updated ";
					var updatedAtTimestamp = data.liveData[0].lastUpdated;
					var updatedAtDate = new Date(updatedAtTimestamp);
					var timeSinceUpdate = new Date() - updatedAtDate;
					const daysSinceUpdate = Math.floor(timeSinceUpdate / 86400000);
					const hoursSinceUpdate = Math.floor(
						(timeSinceUpdate % 86400000) / 3600000
					);
					const minutesSinceUpdate = Math.floor(
						((timeSinceUpdate % 86400000) % 3600000) / 60000
					);
					const secondsSinceUpdate = Math.floor(
						(((timeSinceUpdate % 86400000) % 3600000) % 60000) / 1000
					);
					if (daysSinceUpdate > 0) {
						updatedTime += daysSinceUpdate + "d, ";
					}
					if (hoursSinceUpdate > 0) {
						updatedTime += hoursSinceUpdate + "h, ";
					}
					if (minutesSinceUpdate > 0) {
						updatedTime += minutesSinceUpdate + "m, ";
					}
					updatedTime += secondsSinceUpdate + "s ago";

					var waitTimeElement = document.querySelector(".waitTimes .content ." + park + " .time");
					var statusElement = document.querySelector(".waitTimes .content ." + park + " .status");
					var updatedElement = document.querySelector(".waitTimes .content ." + park + " .updatedTime");
					waitTimeElement.textContent = waitTime;
					statusElement.textContent = operatingStatus;
					updatedElement.textContent = updatedTime;

					resolve();
				},
				(error) => {
					reject(error)
				}
			);
	});
}

//Update wait times with current times in California, Florida and Japan
const timeZoneElements = {
	dl: document.querySelector(".waitTimes .content .dl .currentTime"),
	wdw: document.querySelector(".waitTimes .content .wdw .currentTime"),
	tdl: document.querySelector(".waitTimes .content .tdl .currentTime")
}
function updateTimeZoneTimes() {
	const time = new Date();
	const timeInCalifornia = new Date(time.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
	timeZoneElements.dl.textContent = timeInCalifornia.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
	const timeInFlorida = new Date(time.toLocaleString("en-US", { timeZone: "America/New_York" }));
	timeZoneElements.wdw.textContent = timeInFlorida.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
	const timeInJapan = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
	timeZoneElements.tdl.textContent = timeInJapan.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
}
updateTimeZoneTimes();
setInterval(updateTimeZoneTimes, 1000);

Promise.all([
	fetchWaitTime("dl", "https://api.themeparks.wiki/v1/entity/343b216d-86b1-40c2-83cc-aa5f67b4804b/live"),
	fetchWaitTime("wdw", "https://api.themeparks.wiki/v1/entity/a5241f3b-4ab5-4902-b5ba-435132ef553d/live"),
	fetchWaitTime("tdl", "https://api.themeparks.wiki/v1/entity/dfe25d8e-e234-4020-a261-30c6825d0680/live")
]).then(() => {
	document.querySelector(".waitTimes .content").classList.remove("hidden");
	document.querySelector(".waitTimes .loading").classList.add("hidden");
}).catch((error) => {
	document.querySelector(".waitTimes .error").classList.remove("hidden");
	document.querySelector(".waitTimes .loading").classList.add("hidden");
});


//Populate the database additions container with the newest items
fetch("/api/search/?sort_by=newest_first&min=1&max=15")
	.then((response) => response.json())
	.then(
		(data) => {
			var container = document.querySelector(
				".databaseAdditions .content"
			);
			data.forEach((item) => {
				var currentItemElement = document.createElement("div");
				currentItemElement.className = "item";
				(function (id) {
					currentItemElement.onclick = function () {
						showItemDetails(id);
					};
				})(item.id);

				var imageContainer = document.createElement("div");
				imageContainer.className = "imageContainer";

				if (item.type === "image") {
					var pictureElement = null;
					var imgElement = document.createElement("img");
					imgElement.src = "/resources/" + item.image + "/thumbnail.jpg";
					imageContainer.appendChild(imgElement);
				} else if (item.type === "video") {
					var pictureElement = null;
					var imgElement = document.createElement("img");
					imgElement.src =
						"https://img.youtube.com/vi/" +
						item.video_id +
						"/mqdefault.jpg";
					imageContainer.appendChild(imgElement);
				} else {
					var pictureElement = document.createElement("picture");

					var sourceElement = document.createElement("source");
					sourceElement.srcset =
						"/images/icons/types/" + item.type + "-white.png";
					sourceElement.setAttribute(
						"media",
						"(prefers-color-scheme: dark)"
					);

					var imgElement = document.createElement("img");
					imgElement.src =
						"/images/icons/types/" + item.type + "-black.png";

					pictureElement.appendChild(sourceElement);
					pictureElement.appendChild(imgElement);
					imageContainer.appendChild(pictureElement);
				}

				var infoElement = document.createElement("div");
				infoElement.className = "info";

				var sceneElement = document.createElement("p");
				sceneElement.className = "scene";
				sceneElement.textContent = item.scene;

				var titleElement = document.createElement("h3");
				titleElement.className = "title";
				titleElement.textContent = item.name;

				var infoContainer = document.createElement("div");
				infoContainer.className = "infoContainer";

				var parkElement = document.createElement("p");
				parkElement.textContent = item.park;
				infoContainer.appendChild(parkElement);
				var typeElement = document.createElement("p");
				typeElement.textContent = item.type;
				infoContainer.appendChild(typeElement);
				if (item.author) {
					var authorElement = document.createElement("p");
					authorElement.textContent = item.author.replace(
						/\[([^\][]+)]/g,
						""
					);
					infoContainer.appendChild(authorElement);
				}

				infoElement.appendChild(sceneElement);
				infoElement.appendChild(titleElement);
				infoElement.appendChild(infoContainer);

				currentItemElement.appendChild(imageContainer);
				currentItemElement.appendChild(infoElement);

				container.appendChild(currentItemElement);
			});
			document
				.querySelector(".databaseAdditions .loading")
				.classList.add("hidden");
			container.classList.remove("hidden");
		},
		(error) => {
			document
				.querySelector(".databaseAdditions .loading")
				.classList.add("hidden");
			document
				.querySelector(".databaseAdditions .error")
				.classList.remove("hidden");
		}
	);

//Populate the news articles container with the newest items
fetch("/api/news/list/?min=1&max=15")
	.then((response) => response.json())
	.then(
		(data) => {
			var container = document.querySelector(".news .content");
			data.forEach((item) => {
				var currentItemElement = document.createElement("div");
				currentItemElement.className = "item";
				(function (id) {
					currentItemElement.onclick = function () {
						window.location.href = "/article/" + id;
					};
				})(item.id);

				var imageContainer = document.createElement("div");
				imageContainer.className = "imageContainer";

				var imgElement = document.createElement("img");
				imgElement.src = "/resources/" + item.thumbnail + "/thumbnail.jpg";
				imageContainer.appendChild(imgElement);

				var infoElement = document.createElement("div");
				infoElement.className = "info";

				var titleElement = document.createElement("h3");
				titleElement.className = "title";
				titleElement.textContent = item.title;

				var subtitleElement = document.createElement("h4");
				subtitleElement.className = "subtitle";
				subtitleElement.textContent = item.subtitle;

				var publicationDateElement = document.createElement("p");
				publicationDateElement.className = "publicationDate";
				var publicationDateObject = new Date(0);
				publicationDateObject.setUTCSeconds(
					Number(item.publication_timestamp)
				);
				publicationDateElement.textContent =
					publicationDateObject.toLocaleDateString("en-US", {
						weekday: "short",
						day: "numeric",
						month: "long",
						year: "numeric",
					});

				infoElement.appendChild(titleElement);
				infoElement.appendChild(subtitleElement);
				infoElement.appendChild(publicationDateElement);

				currentItemElement.appendChild(imageContainer);
				currentItemElement.appendChild(infoElement);

				container.appendChild(currentItemElement);
			});
			document.querySelector(".news .loading").classList.add("hidden");
			container.classList.remove("hidden");
		},
		(error) => {
			document.querySelector(".news .loading").classList.add("hidden");
			document.querySelector(".news .error").classList.remove("hidden");
		}
	);

//Update the closing countdown timer
var currentTimestamp;
var launchTimestamp = new Date("2023-01-23T05:00:00Z");

const countdownDOM = {
	container: document.querySelector(".countdown"),
	days: {
		container: document.querySelector(".countdown .days"),
		value: document.querySelector(".countdown .days h1"),
	},
	hours: {
		container: document.querySelector(".countdown .hours"),
		value: document.querySelector(".countdown .hours h1"),
	},
	minutes: {
		container: document.querySelector(".countdown .minutes"),
		value: document.querySelector(".countdown .minutes h1"),
	},
	seconds: {
		container: document.querySelector(".countdown .seconds"),
		value: document.querySelector(".countdown .seconds h1"),
	}
}

function updateCountdown() {
	currentTimestamp = new Date();
	var difference = launchTimestamp.getTime() - currentTimestamp.getTime();

	//If the launch timestamp is in the past, redirect to index.
	if (difference <= 0) {
		countdownDOM.container.classList.add("hidden");
	} else {
		var countdownString = "";

		var days = Math.floor(difference / (1000 * 60 * 60 * 24));
		var hours = Math.floor(
			(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((difference % (1000 * 60)) / 1000);

		if (days <= 0) {
			countdownDOM.days.container.classList.add("hidden");
		} else {
			countdownDOM.days.value.textContent = days;
		}
		if (days <= 0 && hours <= 0) {
			countdownDOM.hours.container.classList.add("hidden");
		} else {
			countdownDOM.hours.value.textContent = hours;
		}
		countdownDOM.minutes.value.textContent = minutes;
		countdownDOM.seconds.value.textContent = seconds;
	}
}
updateCountdown();
setInterval(updateCountdown, 1000);
