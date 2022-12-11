var newsList = {
	searchRange: {
		min: 1,
		max: 21,
	},

	refreshResults: function (preservePreviousResults) {
		if (!preservePreviousResults) {
			//Clear the current results from .resultsContainer
			while (document.querySelector(".newsList .resultsContainer").firstChild) {
				document.querySelector(".newsList .resultsContainer").removeChild(document.querySelector(".newsList .resultsContainer").firstChild);
			}
		}

		//Fetch new results
		fetch("/api/news/list/?min=" + this.searchRange.min + "&max=" + this.searchRange.max)
			.then((response) => response.json())
			.then(
				(data) => {
					if (!preservePreviousResults && data.length === 0) {
						var noResults = document.createElement("p");
						noResults.className = "noResults";
						noResults.textContent = "No articles found.";
						document.querySelector(".newsList .resultsContainer").appendChild(noResults);
					} else if (preservePreviousResults && data.length === 0) {
						var loadMoreButton = document.querySelector(".loadMoreButton");
						loadMoreButton.parentElement.removeChild(loadMoreButton);
					} else {
						if (preservePreviousResults) {
							var loadMoreButton = document.querySelector(".loadMoreButton");
							loadMoreButton.parentElement.removeChild(loadMoreButton);
						}

						for (var i = 0; i < data.length; i++) {
							var currentArticleData = data[i];

							var resultElement = document.createElement("div");
							resultElement.className = "article";
							(function (id) {
								resultElement.onclick = function () {
									showArticleEditor(id);
								};
							})(currentArticleData.id);

							var upperContainer = document.createElement("div");
							upperContainer.classList.add("container");

							var thumbnailContainer = document.createElement("div");
							thumbnailContainer.classList.add("thumbnailContainer");

							var thumbnail = document.createElement("img");
							thumbnail.classList.add("thumbnail");
							thumbnail.src = "/resources/" + currentArticleData.thumbnail + "/thumbnail.jpg";

							var imageElement = document.createElement("img");
							imageElement.classList.add("thumbnail");
							imageElement.classList.add("hidden");
							(function (thumbnail, image) {
								image.onload = function () {
									thumbnail.classList.add("hidden");
									image.classList.remove("hidden");
								}
							})(thumbnail, imageElement);
							imageElement.src = "/resources/" + currentArticleData.thumbnail + "/main.jpg";

							thumbnailContainer.appendChild(thumbnail);
							thumbnailContainer.appendChild(imageElement);

							var textContainer = document.createElement("div");
							textContainer.classList.add("textContainer");

							var titleElement = document.createElement("h1");
							titleElement.classList.add("title");
							titleElement.textContent = currentArticleData.title;

							var subtitleElement = document.createElement("h3");
							subtitleElement.classList.add("subtitle");
							subtitleElement.textContent = currentArticleData.subtitle;

							var contentPreviewElement = document.createElement("p");
							contentPreviewElement.classList.add("contentPreview");
							contentPreviewElement.textContent = currentArticleData.content_preview;

							var authorDateContainer = document.createElement("div");
							authorDateContainer.classList.add("authorDateContainer");

							var authorContainerElement = document.createElement("div");
							authorContainerElement.classList.add("authorContainer");

							var authorImageElement = document.createElement("img");
							authorImageElement.classList.add("authorImage");
							authorImageElement.src = "/images/authors/" + currentArticleData.author.toLowerCase().replaceAll(/[ _.]/g, "") + ".jpg";
							authorContainerElement.appendChild(authorImageElement);

							var authorNameElement = document.createElement("p");
							authorNameElement.classList.add("authorName");
							authorNameElement.textContent = currentArticleData.author;
							authorContainerElement.appendChild(authorNameElement);

							authorDateContainer.appendChild(authorContainerElement);

							var publicationDateElement = document.createElement("p");
							publicationDateElement.classList.add("publicationDate");
							var publicationDateObject = new Date(0);
							publicationDateObject.setUTCSeconds(Number(currentArticleData.publication_timestamp));
							// If the publication date is today, display the time to the minute
							// If the publication date was yesterday, display "Yesterday"
							if (publicationDateObject.toDateString() === new Date().toDateString()) {
								publicationDateElement.textContent = publicationDateObject.toLocaleTimeString([], {
									hour: "numeric",
									minute: "2-digit"
								});
							} else if (publicationDateObject.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
								publicationDateElement.textContent = "Yesterday";
							} else {
								publicationDateElement.textContent = publicationDateObject.toLocaleDateString("en-US", {
									day: "numeric",
									month: "long",
									year: "numeric",
								});
							}
							authorDateContainer.appendChild(publicationDateElement);

							textContainer.appendChild(titleElement);
							textContainer.appendChild(subtitleElement);
							upperContainer.appendChild(thumbnailContainer);
							upperContainer.appendChild(textContainer);
							resultElement.appendChild(upperContainer);

							resultElement.appendChild(contentPreviewElement);
							resultElement.appendChild(authorDateContainer);

							document.querySelector(".newsList .resultsContainer").appendChild(resultElement);
						}

						if (data.length === this.searchRange.max - this.searchRange.min) {
							var loadMoreButton = document.createElement("button");
							loadMoreButton.className = "loadMoreButton";
							loadMoreButton.textContent = "Load More";
							loadMoreButton.addEventListener("click", function () {
								newsList.loadMoreResults();
							});
							document.querySelector(".newsList .resultsContainer").appendChild(loadMoreButton);
						}
					}

					//Hide the loading screen and show the results container
					document.querySelector(".newsList .loadingContainer").classList.add("hidden");
					document.querySelector(".newsList .resultsContainer").classList.remove("hidden");
					document.querySelector(".newsList .errorMessageContainer").classList.add("hidden");
				},
				(error) => {
					document.querySelector(".newsList .errorMessageContainer .title").textContent = "Something Went Wrong";
					document.querySelector(".newsList .errorMessageContainer .subtitle").textContent = "Failed to load news articles.";

					//Hide the loading screen and show the error message container
					document.querySelector(".newsList .loadingContainer").classList.add("hidden");
					document.querySelector(".newsList .resultsContainer").classList.add("hidden");
					document.querySelector(".newsList .errorMessageContainer").classList.remove("hidden");
				}
			);
	},
	loadMoreResults: function () {
		this.searchRange.min += 20;
		this.searchRange.max += 20;
		this.refreshResults(true);
	},
};

newsList.refreshResults();
