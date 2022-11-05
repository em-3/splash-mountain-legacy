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
									window.location.href = "/article/" + id;
								};
							})(currentArticleData.id);

							var imgElement = document.createElement("img");
							imgElement.className = "thumbnail";
							imgElement.src = "/resources/" + currentArticleData.thumbnail + "/thumbnail.jpg";

							var rightSideContainer = document.createElement("div");
							rightSideContainer.className = "right";

							var titleElement = document.createElement("h1");
							titleElement.className = "title";
							titleElement.textContent = currentArticleData.title;

							var subtitleElement = document.createElement("h3");
							subtitleElement.className = "subtitle";
							subtitleElement.textContent = currentArticleData.subtitle;

							var contentPreviewElement = document.createElement("p");
							contentPreviewElement.className = "contentPreview";
							contentPreviewElement.textContent = currentArticleData.content_preview;

							var authorDateContainer = document.createElement("div");
							authorDateContainer.className = "authorDateContainer";

							var authorContainerElement = document.createElement("div");
							authorContainerElement.className = "authorContainer";

							var authorImageElement = document.createElement("img");
							authorImageElement.className = "authorImage";
							authorImageElement.src = "/images/authors/" + currentArticleData.author.toLowerCase().replaceAll(/[ _.]/g, "") + ".jpg";
							authorContainerElement.appendChild(authorImageElement);

							var authorNameElement = document.createElement("p");
							authorNameElement.className = "authorName";
							authorNameElement.textContent = currentArticleData.author;
							authorContainerElement.appendChild(authorNameElement);

							authorDateContainer.appendChild(authorContainerElement);

							var publicationDateElement = document.createElement("p");
							publicationDateElement.className = "publicationDate";
							var publicationDateObject = new Date(0);
							publicationDateObject.setUTCSeconds(Number(currentArticleData.publication_timestamp));
							publicationDateElement.textContent = publicationDateObject.toLocaleDateString("en-US", {
								weekday: "short",
								day: "numeric",
								month: "long",
								year: "numeric",
							});
							authorDateContainer.appendChild(publicationDateElement);

							rightSideContainer.appendChild(titleElement);
							rightSideContainer.appendChild(subtitleElement);
							rightSideContainer.appendChild(contentPreviewElement);
							rightSideContainer.appendChild(authorDateContainer);

							resultElement.appendChild(imgElement);
							resultElement.appendChild(rightSideContainer);
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

function showArticleEditor() {
	document.querySelector(".itemDetailsContainer iframe").src = "/admin/embeds/articleEditor/?mode=newArticle";
	document.querySelector(".itemDetailsContainer").classList.remove("hidden");
}

function hideArticleEditor() {
	document.querySelector(".itemDetailsContainer").classList.add("hidden");
}

//Listen for iframe requests
window.addEventListener("message", function (e) {
	if (e.data.indexOf("closeEditor") === 0) {
		hideArticleEditor();
	}
});

newsList.refreshResults();
