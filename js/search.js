var timeoutID = null;

var searchBar = {
	onfocus: function () {
		document.querySelector(".searchBox .searchField").focus();
		document.body.classList.add("noScroll");
		document.querySelector("header").classList.add("searchActive");
	},
	onblur: function () {
		if (document.querySelector(".searchBox .searchField").value == "") {
			document.body.classList.remove("noScroll");
			document.querySelector("header").classList.remove("searchActive");
		}
	},

	showLoadingContainer: function () {
		document.querySelector(".searchResultsContainer .loadingContainer").classList.remove("hidden");
		document.querySelector(".searchResultsContainer .resultsContainer").classList.add("hidden");
		document.querySelector(".searchResultsContainer .errorMessageContainer").classList.add("hidden");
	},
	showResultsContainer: function () {
		document.querySelector(".searchResultsContainer .loadingContainer").classList.add("hidden");
		document.querySelector(".searchResultsContainer .resultsContainer").classList.remove("hidden");
		document.querySelector(".searchResultsContainer .errorMessageContainer").classList.add("hidden");
	},
	showErrorMessageContainer: function (title, subtitle) {
		document.querySelector(".searchResultsContainer .errorMessageContainer .title").textContent = title;
		document.querySelector(".searchResultsContainer .errorMessageContainer .subtitle").textContent = subtitle;

		document.querySelector(".searchResultsContainer .loadingContainer").classList.add("hidden");
		document.querySelector(".searchResultsContainer .resultsContainer").classList.add("hidden");
		document.querySelector(".searchResultsContainer .errorMessageContainer").classList.remove("hidden");
	},

	close: function () {
		document.querySelector(".searchBox .searchField").value = "";
		document.querySelector(".searchBox .searchField").blur();
		searchBar.onblur();
		clearTimeout(timeoutID);
		setTimeout(function () {
			searchBar.clearSearchResults();
			searchBar.showResultsContainer();
		}, 200);
	},
	updateSearchResults: function () {
		var query = document.querySelector(".searchField").value;

		if (query.length === 0) {
			this.clearSearchResults();
			this.showResultsContainer();
			return;
		}

		if (timeoutID) {
			clearTimeout(timeoutID);
		}

		this.showLoadingContainer();

		//Wait two seconds before updating the search results
		timeoutID = setTimeout(function () {
			//Fetch new results
			fetch("/api/search/?query=" + query)
				.then((response) => response.json())
				.then(
					(results) => {
						searchBar.clearSearchResults();

						if (results.length === 0) {
							searchBar.clearSearchResults();
							searchBar.showErrorMessageContainer("No Results Found", "We couldn't find any matching items in the database.");
						} else {
							for (var i = 0; i < results.length; i++) {
								document.querySelector(".searchResultsContainer .resultsContainer").appendChild(new Item(results[i]).element);
							}

							searchBar.showResultsContainer();
						}
					},
					(error) => {
						searchBar.clearSearchResults();
						searchBar.showErrorMessageContainer("Something Went Wrong", "Unable to load results.");
					}
				);
		}, 1000);
	},
	clearSearchResults: function () {
		while (document.querySelector(".searchResultsContainer .resultsContainer").firstChild) {
			document.querySelector(".searchResultsContainer .resultsContainer").removeChild(document.querySelector(".searchResultsContainer .resultsContainer").firstChild);
		}
	},
};
