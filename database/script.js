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
		id: "author",
		label: "Author",
		hidden: true,
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

function createFilterOptions() {
	//Loop through each filter and create an option element for for it.
	for (var i = 0; i < filters.length; i++) {
		var currentFilter = filters[i];

		if (currentFilter.hidden) {
			continue;
		}

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

function updateDisabledFilters(id) {
	//Get current values of identical filters
	var values = [];
	var filters = document.querySelectorAll(".filterBar .filter." + id);
	for (var i = 0; i < filters.length; i++) {
		var filter = filters[i];
		var select = filter.querySelector("select");
		var value = select.options[select.selectedIndex].value;
		values.push(value);
	}
	for (var i = 0; i < filters.length; i++) {
		var options = filters[i].querySelector("select").options;
		for (var j = 0; j < options.length; j++) {
			var option = options[j];
			if (values.includes(option.value)) {
				option.disabled = true;
			} else {
				option.disabled = false;
			}
		}
	}
}

function addFilter(filterObject, selectedOption) {
	var filterElement = document.createElement("div");
	filterElement.classList.add("filter");
	filterElement.classList.add(filterObject.id);

	var filterName = document.createElement("p");
	filterName.classList.add("name");
	filterName.textContent = filterObject.label + ":";

	if (!filterObject.hidden) {
		var filterSelect = document.createElement("select");
		filterSelect.setAttribute("name", filterObject.id);
		filterSelect.addEventListener("change", function () {
			updateDisabledFilters(filterObject.id);
			databaseBrowser.refreshResults();
		});
		//Get current values of identical filters
		var currentlyUsedValues = [];
		var currentlyUsedFilters = document.querySelectorAll(
			".filterBar .filter." + filterObject.id
		);
		for (var i = 0; i < currentlyUsedFilters.length; i++) {
			var currentlyUsedFilter = currentlyUsedFilters[i];
			var currentlyUsedFilterSelect =
				currentlyUsedFilter.querySelector("select");
			var currentlyUsedFilterValue =
				currentlyUsedFilterSelect.options[
					currentlyUsedFilterSelect.selectedIndex
				].value;
			currentlyUsedValues.push(currentlyUsedFilterValue);
		}
		var defaultHasBeenSelected = false;
		for (var j = 0; j < filterObject.values.length; j++) {
			var filterSelectOption = document.createElement("option");
			filterSelectOption.value = filterObject.values[j];
			filterSelectOption.textContent = filterObject.values[j];
			if (currentlyUsedValues.includes(filterObject.values[j])) {
				filterSelectOption.disabled = true;
			} else if (
				selectedOption &&
				selectedOption === filterObject.values[j] &&
				!currentlyUsedValues.includes(selectedOption)
			) {
				filterSelectOption.setAttribute("selected", true);
				defaultHasBeenSelected = true;
			} else if (defaultHasBeenSelected == false) {
				filterSelectOption.setAttribute("selected", true);
				defaultHasBeenSelected = true;
			}
			filterSelect.appendChild(filterSelectOption);
		}
	} else {
		var filterValueDisplay = document.createElement("p");
		filterValueDisplay.classList.add("value");
		filterValueDisplay.textContent = selectedOption;
	}

	var removeButton = document.createElement("div");
	removeButton.classList.add("removeButton");
	removeButton.innerHTML = "<iconify-icon icon='mdi:close'></iconify-icon>";
	removeButton.addEventListener("click", function () {
		if (!filterObject.hidden) {
			document.querySelector(".availableFilters .filter." + filterObject.id)
				.classList.remove("disabled");
		}
		filterElement.parentElement.removeChild(filterElement);
		databaseBrowser.refreshResults();
	});

	filterElement.appendChild(filterName);
	if (!filterObject.hidden) {
		filterElement.appendChild(filterSelect)
	} else {
		filterElement.appendChild(filterValueDisplay);
	}
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

	if (!filterObject.hidden) updateDisabledFilters(filterObject.id);
	databaseBrowser.refreshResults();
}

var databaseBrowser = {
	abortController: null,
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
		if (databaseBrowser.abortController) {
			databaseBrowser.abortController.abort();
		}

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
			var currentFilter = activeFilters[i];
			var filterID = currentFilter.classList[1];

			var parameterName;
			var valueCase;
			for (var j = 0; j < filters.length; j++) {
				if (filters[j].id === filterID) {
					parameterName = filters[j].parameterName;
					valueCase = filters[j].valueCase;
				}
			}

			//If the filter isn't a hidden filter, get the selected value
			if (!currentFilter.querySelector(".value")) {
				//Get the selected option for this filter's select element.
				var filterElement = currentFilter.querySelector("select");
				var filterValue =
					filterElement.options[filterElement.selectedIndex].value;
			} else {
				var filterValue = currentFilter.querySelector(".value").textContent;
			}
			if (filterValue != "") {
				if (parameterName) {
					PHPParams += character + parameterName + "=";
				} else {
					PHPParams += character + filterID + "=";
				}
				if (valueCase === "lower") {
					PHPParams += filterValue.toLowerCase();
				} else {
					PHPParams += filterValue;
				}
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
		}

		//Fetch new results
		databaseBrowser.abortController = new AbortController();
		fetch(
			"/api/search/" +
				PHPParams +
				character +
				"min=" +
				databaseBrowser.searchRange.min +
				"&max=" +
				databaseBrowser.searchRange.max,
				 {
					signal: databaseBrowser.abortController.signal,
				 }
		)
			.then((response) => response.json())
			.then(
				(data) => {
					if (!preservePreviousResults) {
						//Clear the current results from .resultsContainer
						while (
							document.querySelector(
								".databaseBrowser .resultsContainer"
							).firstChild
						) {
							document
								.querySelector(
									".databaseBrowser .resultsContainer"
								)
								.removeChild(
									document.querySelector(
										".databaseBrowser .resultsContainer"
									).firstChild
								);
						}
					}
					if (!preservePreviousResults && data.search_results.length === 0) {
						var noResults = document.createElement("div");
						noResults.className = "noResults";
						noResults.innerHTML = `
							<div class="iconContainer">
								<iconify-icon icon="mdi:bee" width="48"></iconify-icon>
							</div>
							<h2>There's Nothing In Here But Bees!</h2>
							<p>We couldn't find any results.</p>
						`;
						document.querySelector(".databaseBrowser .resultsContainer").appendChild(noResults);
					} else if (preservePreviousResults && data.search_results.length === 0) {
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

						for (var i = 0; i < data.search_results.length; i++) {
							var currentItemData = data.search_results[i];
							var item = new Item(currentItemData);
							document
								.querySelector(
									".databaseBrowser .resultsContainer"
								)
								.appendChild(item.element);
						}

						if (
							data.search_results.length ===
							databaseBrowser.searchRange.max - databaseBrowser.searchRange.min
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
		databaseBrowser.searchRange.min += 20;
		databaseBrowser.searchRange.max += 20;
		this.refreshResults(true);
	},
};

databaseBrowser.refreshResults();

//Load available tags
/*
fetch("/api/tags/")
	.then((request) => request.json())
	.then((data) => {
		var tagFilterOption = {};
		tagFilterOption.id = "tags";
		tagFilterOption.parameterName = "tags[]";
		tagFilterOption.label = "Tag";
		tagFilterOption.values = data;
		tagFilterOption.max = data.length;
		filters.push(tagFilterOption);
		//Load in filter options
		createFilterOptions();
		//Check URL parameters to determine whether to add a tag filter
		var url = new URL(window.location.href);
		var params = url.searchParams;
		var tag = params.get("tag");
		if (tag) {
			addFilter(tagFilterOption, tag);
			databaseBrowser.refreshResults();
		}
	});
	*/

createFilterOptions();

//Check the URL for a query and/or filters
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("query")) {
	document.querySelector(
		".databaseBrowser .searchField input"
	).value = urlParams.get("query");
}
for (var i = 0; i < filters.length; i++) {
	if (urlParams.has(filters[i].id)) {
		addFilter(filters[i], urlParams.get(filters[i].id));
	}
}
