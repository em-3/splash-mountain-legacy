//Populate the database additions container with the newest items
fetch("/api/search/?sort_by=date_added&min=1&max=15")
	.then((response) => response.json())
	.then(
		(data) => {
			var container = document.querySelector(".databaseAdditions .content");
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
					imgElement.src = "/resources/" + item.image + "/thumbnail";
					imageContainer.appendChild(imgElement);
				} else if (item.type === "video") {
					var pictureElement = null;
					var imgElement = document.createElement("img");
					imgElement.src = "https://img.youtube.com/vi/" + item.video_id + "/mqdefault.jpg";
					imageContainer.appendChild(imgElement);
				} else {
					var pictureElement = document.createElement("picture");

					var sourceElement = document.createElement("source");
					sourceElement.srcset = "/images/icons/types/" + item.type + "-white.png";
					sourceElement.setAttribute("media", "(prefers-color-scheme: dark)");

					var imgElement = document.createElement("img");
					imgElement.src = "/images/icons/types/" + item.type + "-black.png";

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
					authorElement.textContent = item.author.replace(/\[([^\][]+)]/g, "");
					infoContainer.appendChild(authorElement);
				}

				infoElement.appendChild(sceneElement);
				infoElement.appendChild(titleElement);
				infoElement.appendChild(infoContainer);

				currentItemElement.appendChild(imageContainer);
				currentItemElement.appendChild(infoElement);

				container.appendChild(currentItemElement);
			});
			document.querySelector(".databaseAdditions .loading").classList.add("hidden");
			container.classList.remove("hidden");
		},
		(error) => {
			document.querySelector(".databaseAdditions .loading").classList.add("hidden");
			document.querySelector(".databaseAdditions .error").classList.remove("hidden");
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
				imgElement.src = "/resources/" + item.thumbnail + "/thumbnail";
				imageContainer.appendChild(imgElement);

				var infoElement = document.createElement("div");
				infoElement.className = "info";

				var titleElement = document.createElement("h3");
				titleElement.className = "title";
				titleElement.textContent = item.title;

				var subtitleElement = document.createElement("h4");
				subtitleElement.className = "subtitle";
				subtitleElement.textContent = item.subtitle;

				var infoContainer = document.createElement("div");
				infoContainer.className = "infoContainer";

				var publicationDateElement = document.createElement("p");
				var publicationDateObject = new Date(0);
				publicationDateObject.setUTCSeconds(Number(item.publication_timestamp));
				publicationDateElement.textContent = publicationDateObject.toLocaleDateString("en-US", {
					weekday: "short",
					day: "numeric",
					month: "long",
					year: "numeric",
				});
				infoContainer.appendChild(publicationDateElement);
				var authorElement = document.createElement("p");
				authorElement.textContent = item.author;
				infoContainer.appendChild(authorElement);

				infoElement.appendChild(titleElement);
				infoElement.appendChild(subtitleElement);
				infoElement.appendChild(infoContainer);

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

//When the user navigates to a different browser tab, replace the video element with a picture element to prevent a frozen animation.
window.onblur = function () {
	document.querySelector("section.header .foreground video").classList.add("hidden");
	document.querySelector("section.header .foreground img").classList.remove("hidden");
};
