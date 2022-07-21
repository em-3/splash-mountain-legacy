var filters = [
	{
		id: "park",
		label: "Park",
		values: ["WDW", "DL", "TDL"],
		max: 1,
	},
	{
		id: "type",
		label: "Type",
		values: ["image", "video", "audio", "text", "date"],
		max: 1,
	},
	{
		id: "scene",
		label: "Scene",
		values: [
			"In the Park",
			"Critter Country",
			"Frontierland",
			"Briar Patch Store",
			"Attraction",
			"Exterior",
			"Queue",
			"Loading Zone",
			"Lift A",
			"Briar Patch",
			"Lift B",
			"HDYD Exterior",
			"HDYD Interior",
			"EGALP Pre-Bees",
			"EGALP Bees",
			"EGALP LP",
			"Final Lift",
			"ZDDD Exterior",
			"ZDDD Showboat",
			"ZDDD Homecoming",
			"ZDDD Unload",
			"Photos",
			"Exit",
		],
		max: 1,
	},
];

//Load available tags
fetch("/api/tags/")
	.then((request) => request.json())
	.then((data) => {
		var tagFilterOption = {};
		tagFilterOption.id = "tag";
		tagFilterOption.label = "Tag";
		tagFilterOption.values = data;
		filters.push(tagFilterOption);
		createFilterOptions();
	});

function createFilterOptions() {
	//Loop through each filter and create an option element for for it.
	for (var i = 0; i < filters.length; i++) {
		var currentFilter = filters[i];

		var filterElement = document.createElement("div");
		filterElement.classList.add("filter");
		filterElement.classList.add(currentFilter.id);
		(function (filterObject) {
			filterElement.onclick = function () {
				addFilter(filterObject);
				hideFilterSelect();
			};
		})(currentFilter);

		var filterName = document.createElement("p");
		filterName.classList.add("name");
		filterName.textContent = currentFilter.label;

		filterElement.appendChild(filterName);
		document
			.querySelector(".filterSelect .availableFilters")
			.appendChild(filterElement);
	}
}

function showFilterSelect() {
	document.querySelector(".searchControls").scrollTo({
		top: 0,
		left: 0,
		behavior: "smooth",
	});
	document.querySelector(".controls").classList.add("hidden");
	document.querySelector(".filterSelect").classList.remove("hidden");
	setTimeout(function () {
		document
			.querySelector(".controls")
			.style.setProperty("display", "none", "important");
	}, 200);
}

function hideFilterSelect() {
	document.querySelector(".controls").style.display = null;
	document.querySelector(".controls").classList.remove("hidden");
	document.querySelector(".filterSelect").classList.add("hidden");
}

function addFilter(filterObject) {
	var filterElement = document.createElement("div");
	filterElement.classList.add("filter");
	filterElement.classList.add(filterObject.id);

	var filterName = document.createElement("p");
	filterName.classList.add("name");
	filterName.textContent = filterObject.label + ":";

	var filterSelect = document.createElement("select");
	filterSelect.setAttribute("name", filterObject.id);
	filterSelect.addEventListener("change", function () {
		databaseBrowser.refreshResults();
	});

	for (var j = 0; j < filterObject.values.length; j++) {
		var filterSelectOption = document.createElement("option");
		filterSelectOption.setAttribute("value", filterObject.values[j]);
		filterSelectOption.textContent = filterObject.values[j];
		if (j === 0) {
			filterSelectOption.setAttribute("selected", true);
		}
		filterSelect.appendChild(filterSelectOption);
	}

	var removeButton = document.createElement("div");
	removeButton.classList.add("removeButton");
	removeButton.textContent = "✕";
	removeButton.addEventListener("click", function () {
		document
			.querySelector(".availableFilters .filter." + filterObject.id)
			.classList.remove("disabled");
		filterElement.parentElement.removeChild(filterElement);
		databaseBrowser.refreshResults();
	});

	filterElement.appendChild(filterName);
	filterElement.appendChild(filterSelect);
	filterElement.appendChild(removeButton);
	document.querySelector(".filterBar .filters").appendChild(filterElement);

	var filterCount = document.querySelectorAll(
		".filterBar .filter." + filterObject.id
	).length;
	if (filterObject.max === filterCount) {
		document
			.querySelector(".availableFilters .filter." + filterObject.id)
			.classList.add("disabled");
	}

	databaseBrowser.refreshResults();
}

var databaseBrowser = {
	searchRange: {
		min: 1,
		max: 21,
	},

	searchBar: {
		timeoutID: null,
		oninput: function () {
			if (this.timeoutID) {
				clearTimeout(this.timeoutID);
			}

			document
				.querySelector(".databaseBrowser .loadingContainer")
				.classList.remove("hidden");
			document
				.querySelector(".databaseBrowser .resultsContainer")
				.classList.add("hidden");
			document
				.querySelector(".databaseBrowser .errorMessageContainer")
				.classList.add("hidden");

			//Wait a second before updating the search results
			this.timeoutID = setTimeout(databaseBrowser.refreshResults, 1000);
		},
		onchange: function () {
			databaseBrowser.refreshResults();
		},
	},
	refreshResults: function (preservePreviousResults) {
		var PHPParams = "";
		var character = "?";

		var searchInput = document.querySelector(".searchField input");
		if (searchInput.value.length > 0) {
			PHPParams += character + "query=" + searchInput.value;
			character = "&";
		}

		var activeFilters = document.querySelectorAll(
			".filterBar .filters .filter"
		);
		for (var i = 0; i < activeFilters.length; i++) {
			var filterID = activeFilters[i].classList[1];
			//Get the selected option for this filter's select element.
			var filterElement = document.querySelector(
				"select[name='" + filterID + "']"
			);
			var filterValue =
				filterElement.options[filterElement.selectedIndex].value;
			if (filterValue != "") {
				PHPParams += character + filterID + "=" + filterValue;
				character = "&";
			}
		}

		var sortByElement = document.querySelector("#sortBy");
		var sortByValue =
			sortByElement.options[sortByElement.selectedIndex].value;
		PHPParams += character + "sort_by=" + sortByValue;
		character = "&";

		if (!preservePreviousResults) {
			databaseBrowser.searchRange.min = 1;
			databaseBrowser.searchRange.max = 21;
			//Clear the current results from .resultsContainer
			while (
				document.querySelector(".databaseBrowser .resultsContainer")
					.firstChild
			) {
				document
					.querySelector(".databaseBrowser .resultsContainer")
					.removeChild(
						document.querySelector(
							".databaseBrowser .resultsContainer"
						).firstChild
					);
			}
		}

		//Fetch new results
		fetch(
			"/api/search/" +
				PHPParams +
				character +
				"min=" +
				databaseBrowser.searchRange.min +
				"&max=" +
				databaseBrowser.searchRange.max
		)
			.then((response) => response.json())
			.then(
				(data) => {
					if (!preservePreviousResults && data.length === 0) {
						var noResults = document.createElement("p");
						noResults.className = "noResults";
						noResults.textContent = "No results found.";
						document
							.querySelector(".databaseBrowser .resultsContainer")
							.appendChild(noResults);
					} else if (preservePreviousResults && data.length === 0) {
						var loadMoreButton = document.querySelector(
							".databaseBrowser .loadMoreButton"
						);
						loadMoreButton.parentElement.removeChild(
							loadMoreButton
						);
					} else {
						if (preservePreviousResults) {
							var loadMoreButton = document.querySelector(
								".databaseBrowser .loadMoreButton"
							);
							loadMoreButton.parentElement.removeChild(
								loadMoreButton
							);
						}

						for (var i = 0; i < data.length; i++) {
							var currentItemData = data[i];

							var resultElement = document.createElement("div");
							resultElement.className = "listItem";
							(function (id) {
								resultElement.onclick = function () {
									showItemDetails(id);
								};
							})(currentItemData.id);

							if (currentItemData.type === "image") {
								var pictureElement = null;
								var imgElement = document.createElement("img");
								imgElement.className = "image";
								imgElement.src =
									"/resources/" +
									currentItemData.image +
									"/thumbnail";
							} else if (currentItemData.type === "video") {
								var pictureElement = null;
								var imgElement = document.createElement("img");
								imgElement.className = "image";
								imgElement.src =
									"https://img.youtube.com/vi/" +
									currentItemData.video_id +
									"/mqdefault.jpg";
							} else {
								var pictureElement =
									document.createElement("picture");
								pictureElement.className = "image";

								var sourceElement =
									document.createElement("source");
								sourceElement.srcset =
									"/images/icons/types/" +
									currentItemData.type +
									"-white.png";
								sourceElement.setAttribute(
									"media",
									"(prefers-color-scheme: dark)"
								);

								var imgElement = document.createElement("img");
								imgElement.src =
									"/images/icons/types/" +
									currentItemData.type +
									"-black.png";

								pictureElement.appendChild(sourceElement);
								pictureElement.appendChild(imgElement);
							}

							var rightSideContainer =
								document.createElement("div");
							rightSideContainer.className = "right";

							var sceneElement = document.createElement("p");
							sceneElement.className = "scene";
							sceneElement.textContent = currentItemData.scene;

							var nameElement = document.createElement("h3");
							nameElement.className = "name";
							nameElement.textContent = currentItemData.name;

							var infoContainerElement =
								document.createElement("div");
							infoContainerElement.className = "infoContainer";

							var parkElement = document.createElement("p");
							parkElement.className = "park";
							parkElement.textContent = currentItemData.park;
							infoContainerElement.appendChild(parkElement);

							var typeElement = document.createElement("p");
							typeElement.className = "type";
							typeElement.textContent = currentItemData.type;
							infoContainerElement.appendChild(typeElement);

							if (currentItemData.author) {
								var authorElement = document.createElement("p");
								authorElement.className = "author";
								authorElement.textContent =
									currentItemData.author.replace(
										/\[([^\][]+)]/g,
										""
									);
								infoContainerElement.appendChild(authorElement);
							}

							rightSideContainer.appendChild(sceneElement);
							rightSideContainer.appendChild(nameElement);
							rightSideContainer.appendChild(
								infoContainerElement
							);

							if (pictureElement) {
								resultElement.appendChild(pictureElement);
							} else if (imgElement) {
								resultElement.appendChild(imgElement);
							}
							resultElement.appendChild(rightSideContainer);
							document
								.querySelector(
									".databaseBrowser .resultsContainer"
								)
								.appendChild(resultElement);
						}

						if (
							data.length ===
							this.searchRange.max - this.searchRange.min
						) {
							var loadMoreButton =
								document.createElement("button");
							loadMoreButton.className = "loadMoreButton";
							loadMoreButton.textContent = "Load More";
							loadMoreButton.addEventListener(
								"click",
								function () {
									databaseBrowser.loadMoreResults();
								}
							);
							document
								.querySelector(
									".databaseBrowser .resultsContainer"
								)
								.appendChild(loadMoreButton);
						}
					}

					//Hide the loading screen and show the results container
					document
						.querySelector(".databaseBrowser .loadingContainer")
						.classList.add("hidden");
					document
						.querySelector(".databaseBrowser .resultsContainer")
						.classList.remove("hidden");
					document
						.querySelector(
							".databaseBrowser .errorMessageContainer"
						)
						.classList.add("hidden");
				},
				(error) => {
					document.querySelector(
						".databaseBrowser .errorMessageContainer .title"
					).textContent = "Something Went Wrong";
					document.querySelector(
						".databaseBrowser .errorMessageContainer .subtitle"
					).textContent = "Failed to load database items.";

					//Hide the loading screen and show the error message container
					document
						.querySelector(".databaseBrowser .loadingContainer")
						.classList.add("hidden");
					document
						.querySelector(".databaseBrowser .resultsContainer")
						.classList.add("hidden");
					document
						.querySelector(
							".databaseBrowser .errorMessageContainer"
						)
						.classList.remove("hidden");
				}
			);
	},
	loadMoreResults: function () {
		this.searchRange.min += 20;
		this.searchRange.max += 20;
		this.refreshResults(true);
	},
};

databaseBrowser.refreshResults();
