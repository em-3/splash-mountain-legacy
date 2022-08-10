//Get user profile information
fetch("/api/profile/index.php")
	.then((reponse) => reponse.json())
	.then((data) => {
		if (data.status === "success") {
			var profileInfo = data.user_data;
			document.querySelector(".profileInformation .profilePicture").src = profileInfo.avatar_url;
			document.querySelector(".profileInformation .name").textContent = profileInfo.username;
			var authorizationLevel;
			switch (profileInfo.clearance) {
				case "0":
					authorizationLevel = "Admin";
					break;
				case "1":
					authorizationLevel = "Launch Team";
					break;
			}
			document.querySelector(".profileInformation .authorizationLevel").textContent = authorizationLevel;
		} else {
			document.querySelector(".profileInformation .name").textContent = "Error";
			document.querySelector(".profileInformation .authorizationLevel").textContent = "Failed to load user profile.";
		}
	});

//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var openEditor = params.get("openEditor");
var id = params.get("id");

if (openEditor && openEditor === "item" && id) {
	//Open the item editor
	showDatabaseItemEditor(id);
} else if (openEditor && openEditor === "article" && id) {
	//Open the article editor
	showExistingArticleEditor(id);
}

function selectTab(listName) {
	//Deselect all tabs
	var tabs = document.querySelectorAll(".tabContainer .tab");
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].classList.remove("selected");
	}
	//Hide all lists
	var lists = document.querySelectorAll(".list");
	for (var i = 0; i < lists.length; i++) {
		lists[i].classList.add("hidden");
	}

	//Populate the selected list
	switch (listName) {
		case "database":
			databaseList.refreshResults();
			break;
		case "news":
			newsList.refreshResults();
			break;
	}

	//Select the correct tab and show the correct list
	var tab = document.querySelector(".tab." + listName);
	tab.classList.add("selected");
	var list = document.querySelector(".list." + listName);
	list.classList.remove("hidden");
}

function showNewItemEditor() {
	document.querySelector(".databaseItemEditorContainer iframe").src = "/admin/embeds/databaseItemEditor/?mode=newItem";

	document.querySelector(".overlay").classList.add("active");
	document.querySelector(".databaseItemEditorContainer").classList.remove("hidden");
}

function showDatabaseItemEditor(itemID) {
	document.querySelector(".databaseItemEditorContainer iframe").src = "/admin/embeds/databaseItemEditor/?mode=editor&id=" + itemID;

	document.querySelector(".overlay").classList.add("active");
	document.querySelector(".databaseItemEditorContainer").classList.remove("hidden");
}

function hideItemEditor() {
	document.querySelector(".overlay").classList.remove("active");
	document.querySelector(".databaseItemEditorContainer").classList.add("hidden");

	setTimeout(function () {
		document.querySelector(".databaseItemEditorContainer iframe").src = "about:blank";
	}, 500);
}

var newsList = {
	searchRange: {
		min: 1,
		max: 21,
	},
	searchBar: {
		timeoutID: null,
		oninput: function () {
			var query = document.querySelector(".searchField").value;

			if (this.timeoutID) {
				clearTimeout(this.timeoutID);
			}

			document.querySelector(".list.news .loadingContainer").classList.remove("hidden");
			document.querySelector(".list.news .resultsContainer").classList.add("hidden");
			document.querySelector(".list.news .errorMessageContainer").classList.add("hidden");

			//Wait a second before updating the search results
			this.timeoutID = setTimeout(newsList.refreshResults, 1000);
		},
		onchange: function () {
			newsList.refreshResults();
		},
	},
	refreshResults: function (preservePreviousResults) {
		var PHPParams = "";
		var character = "?";

		var filterValue = document.querySelector(".list.news .filters .searchField input").value;
		if (filterValue != "") {
			PHPParams += character + "query=" + filterValue;
			character = "&";
		}

		if (!preservePreviousResults) {
			//Clear the current results
			while (document.querySelector(".list.news .resultsContainer").firstChild) {
				document.querySelector(".list.news .resultsContainer").removeChild(document.querySelector(".list.news .resultsContainer").firstChild);
			}
		}

		//Fetch new results
		fetch("/api/news/list/" + PHPParams + character + "min=" + newsList.searchRange.min + "&max=" + newsList.searchRange.max + "&show_unpublished=true")
			.then((response) => response.json())
			.then(
				(data) => {
					if (!preservePreviousResults && data.length === 0) {
						var noResults = document.createElement("p");
						noResults.className = "noResults";
						noResults.textContent = "No results found.";
						document.querySelector(".list.news .resultsContainer").appendChild(noResults);
					} else if (preservePreviousResults && data.length === 0) {
						var loadMoreButton = document.querySelector(".list.news .loadMoreButton");
						loadMoreButton.parentElement.removeChild(loadMoreButton);
					} else {
						if (preservePreviousResults) {
							var loadMoreButton = document.querySelector(".list.news .loadMoreButton");
							loadMoreButton.parentElement.removeChild(loadMoreButton);
						}

						for (var i = 0; i < data.length; i++) {
							var currentItemData = data[i];

							var resultElement = document.createElement("div");
							resultElement.className = "result";
							(function (id) {
								resultElement.onclick = function () {
									showExistingArticleEditor(id);
								};
							})(currentItemData.id);

							var imgElement = document.createElement("img");
							imgElement.className = "image";
							imgElement.src = "/resources/" + currentItemData.thumbnail + "/thumbnail";

							var rightSideContainer = document.createElement("div");
							rightSideContainer.className = "right";

							if (currentItemData.hidden === "1") {
								resultElement.classList.add("hiddenItem");
								var hiddenElement = document.createElement("p");
								hiddenElement.textContent = "Hidden Item";
								rightSideContainer.appendChild(hiddenElement);
							}

							var titleElement = document.createElement("h3");
							titleElement.className = "title";
							titleElement.textContent = currentItemData.title;

							var subtitleElement = document.createElement("p");
							subtitleElement.className = "subtitle";
							subtitleElement.textContent = currentItemData.subtitle;

							var infoContainerElement = document.createElement("div");
							infoContainerElement.className = "infoContainer";

							var publicationDateElement = document.createElement("p");
							publicationDateElement.className = "publicationDate";
							var publicationDateObject = new Date(0);
							publicationDateObject.setUTCSeconds(Number(currentItemData.publication_timestamp));
							publicationDateElement.textContent = publicationDateObject.toLocaleDateString("en-US", {
								day: "numeric",
								month: "long",
								year: "numeric",
							});
							infoContainerElement.appendChild(publicationDateElement);

							var authorElement = document.createElement("p");
							authorElement.className = "author";
							authorElement.textContent = currentItemData.author;
							infoContainerElement.appendChild(authorElement);

							rightSideContainer.appendChild(titleElement);
							rightSideContainer.appendChild(subtitleElement);
							rightSideContainer.appendChild(infoContainerElement);

							resultElement.appendChild(imgElement);
							resultElement.appendChild(rightSideContainer);
							document.querySelector(".list.news .resultsContainer").appendChild(resultElement);
						}

						if (data.length === newsList.searchRange.max - newsList.searchRange.min) {
							var loadMoreButton = document.createElement("button");
							loadMoreButton.className = "loadMoreButton";
							loadMoreButton.textContent = "Load More";
							loadMoreButton.addEventListener("click", function () {
								newsList.loadMoreResults();
							});
							document.querySelector(".list.news .resultsContainer").appendChild(loadMoreButton);
						}
					}

					//Hide the loading screen and show the results container
					document.querySelector(".list.news .loadingContainer").classList.add("hidden");
					document.querySelector(".list.news .resultsContainer").classList.remove("hidden");
					document.querySelector(".list.news .errorMessageContainer").classList.add("hidden");
				},
				(error) => {
					document.querySelector(".list.news .errorMessageContainer .title").textContent = "Something Went Wrong";
					document.querySelector(".list.news .errorMessageContainer .subtitle").textContent = "Failed to load news articles.";

					//Hide the loading screen and show the error message container
					document.querySelector(".list.news .loadingContainer").classList.add("hidden");
					document.querySelector(".list.news .resultsContainer").classList.add("hidden");
					document.querySelector(".list.news .errorMessageContainer").classList.remove("hidden");
				}
			);
	},
	loadMoreResults: function () {
		this.searchRange.min += 20;
		this.searchRange.max += 20;
		this.refreshResults(true);
	},
};

function showNewArticleEditor() {
	document.querySelector(".articleEditorContainer iframe").src = "/admin/embeds/articleEditor/?mode=newArticle";

	document.querySelector(".overlay").classList.add("active");
	document.querySelector(".articleEditorContainer").classList.remove("hidden");
}

function showExistingArticleEditor(articleID) {
	document.querySelector(".articleEditorContainer iframe").src = "/admin/embeds/articleEditor/?mode=editor&id=" + articleID;

	document.querySelector(".overlay").classList.add("active");
	document.querySelector(".articleEditorContainer").classList.remove("hidden");
}

function hideArticleEditor() {
	document.querySelector(".overlay").classList.remove("active");
	document.querySelector(".articleEditorContainer").classList.add("hidden");

	setTimeout(function () {
		document.querySelector(".articleEditorContainer iframe").src = "about:blank";
	}, 500);
}

async function logout() {
	var confirm = await dialog.confirm("Logout", "Are you sure you want to logout?", {
		cancellable: true,
		buttons: [
			{
				text: "Logout",
				type: "active",
			},
		],
	});
	if (confirm !== 0) {
		return;
	}

	window.location.href = "/logout.php";
}

window.onmessage = function (e) {
	if (e.data === "closeItemEditor") {
		hideItemEditor();
		databaseList.refreshResults();
	} else if (e.data === "closeArticleEditor") {
		hideArticleEditor();
		newsList.refreshResults();
	}
};

localStorage.setItem("adminAccess", "true");
