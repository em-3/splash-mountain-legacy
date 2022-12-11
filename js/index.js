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

	//If the launch timestamp is in the past, redirect to index.html.
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
