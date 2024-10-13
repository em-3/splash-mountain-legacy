function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Components
var refreshableDatabaseBrowsers = [];
function DatabaseBrowser(options) {
	this.element = document.createElement("div");
	this.element.classList.add("databaseBrowser");
	this.element.innerHTML = /*html*/`
		<div class="searchControls">
			<div class="searchField">
				<input type="text" placeholder="Search">
			</div>

			<button class="match">
				<iconify-icon icon="mdi:magnify-plus"></iconify-icon>
				<span>Match</span>
			</button>

			<button class="sortBy">
				<iconify-icon icon="mdi:sort"></iconify-icon>
				<span>Sort By</span>
			</button>

			<button class="addFilter">
				<iconify-icon icon="mdi:plus"></iconify-icon>
				<span>Add Filter</span>
			</button>
			<div class="filters"></div>
		</div>
		<div class="loadingContainer">
			<div class="loadingAnimationEllipsis">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</div>
		<div class="resultsContainer hidden"></div>
		<div class="errorMessageContainer hidden">
			<h2 class="title"></h2>
			<p class="subtitle"></p>
		</div>
	`;
	
	this.filters = [
		{
			id: "type",
			icon: "mdi:attachment",
			label: "Type",
			type: "list",
			values: ["image", "video", "audio", "text", "date"],
			max: 1,
		},
		{
			id: "park",
			icon: "material-symbols:push-pin",
			label: "Park",
			type: "list",
			values: ["WDW", "DL", "TDL"],
			max: 1,
		},
		{
			id: "scene",
			icon: "material-symbols:pin-drop",
			label: "Scene",
			type: "list",
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
		undefined,
		undefined,
		{
			id: "dateRange",
			icon: "mdi:calendar",
			label: "Date Range",
			type: "dateRange",
			values: [
				{
					label: "Start Date",
					parameterName: "startDate",
					required: true,
					// Set the default value to July 17, 1989
					defaultValue: new Date("1989-07-17").toISOString().substring(0, 10),
					formatValue: function (value) {
						
					}
				},
				{
					label: "End Date",
					parameterName: "endDate",
					required: true,
					// Set the default value to today
					defaultValue: new Date().toISOString().substring(0, 10),
					formatValue: function (value) {
						
					}
				}
			],
			getStringFromValues: function (values) {
				// Each value is the .value of a date input element
				// Convert each value to a string in the format M/D/YY, with time zone in UTC
				var startDate = new Date(values[0]);
				var endDate = new Date(values[1]);
				var startDateString = startDate.toLocaleDateString("en-US", { timeZone: "UTC" });
				var endDateString = endDate.toLocaleDateString("en-US", { timeZone: "UTC" });
				return startDateString + " - " + endDateString;
			},
			getValuesFromString: function (string) {
				var values = string.split(" - ");
				var startDate = new Date(values[0]);
				var endDate = new Date(values[1]);
				var startDateString = startDate.toISOString().substring(0, 10);
				var endDateString = endDate.toISOString().substring(0, 10);
				return [startDateString, endDateString];
			},
			max: 1,
		},
		{
			adminAccess: true,
			id: "visibility",
			icon: "mdi:eye",
			label: "Visibility",
			type: "list",
			values: ["All", "Public", "Unlisted"],
			parameterValues: ["all", "public", "private"],
			max: 1,
		},
	];
	this.match = ["name", "description", "visible_content"];
	this.sortBy = "name";
	this.abortController = null;
	this.searchRange = {
		min: 1,
		max: 21, 	
	};

	this.selectedItems = [];
	if (options?.preselectedItems) {
		this.selectedItems = options.preselectedItems;
	}
	this.selectItem = function (item) {
		if (this.selectedItems.includes(item.id)) {
			this.selectedItems.splice(this.selectedItems.indexOf(item.id), 1);
			item.element.classList.remove("selected");
		} else {
			this.selectedItems.push(item.id);
			item.element.classList.add("selected");
		}
	};

	this.presentFilterSelect = function (e) {
		var adminAccess = localStorage.getItem("adminAccess") === "true";
		var items = this.filters.filter((filter) => !filter.hidden && (!filter.adminAccess || adminAccess));
		items = items.map((filter) => {
			return {
				label: filter.label,
				icon: filter.icon,
				disabled: filter.disabled,
				callback: () => {
					this.presentFilterValueSelect({
						clientX: e.clientX,
						clientY: e.clientY,
					}, filter);
				},
			};
		});
		contextMenu.present({
			x: e.clientX,
			y: e.clientY,
			items: items,
		});
	};
	this.presentFilterValueSelect = function (e, filterObject, filterElement) {
		var currentlyUsedFilters = this.element.querySelectorAll(
			".filter." + filterObject.id
		);
		var currentlyUsedValues = [];
		
		// Get current values of identical filters
		for (var i = 0; i < currentlyUsedFilters.length; i++) {
			var currentlyUsedFilterValue = currentlyUsedFilters[i].querySelector(".value").textContent;
			currentlyUsedValues.push(currentlyUsedFilterValue);
		}

		if (filterObject.type === "list") {
			if (filterObject.values.length > 10) {
				dialog.list(
					"Select " + filterObject.label,
					"Select a " + filterObject.label.toLowerCase() + " to filter by.",
					filterObject.values.filter(
						(value) => !currentlyUsedValues.includes(value)
					).map((value) => {
						return {
							label: value
						};
					}),
					{
						cancellable: true,
						immediate: true,
					}
				).then((response) => {
					if (response.type === "listSelection") {
						if (filterElement) {
							filterElement.querySelector(".value").textContent = filterObject.values[response.index];
							this.refreshResults();
						} else {
							this.addFilter(filterObject, filterObject.values[response.index]);
						}
					}
				});
			} else {
				contextMenu.present({
					x: e.clientX,
					y: e.clientY,
					items: filterObject.values.map((value) => {
						var disabled = false;
						if (currentlyUsedValues.includes(value)) {
							disabled = true;
						}
						return {
							label: value,
							disabled: disabled,
							callback: () => {
								if (filterElement) {
									filterElement.querySelector(".value").textContent = value;
							this.refreshResults();
								} else {
									this.addFilter(filterObject, value);
								}
							},
						};
					}),
				})
			}
		} else if (filterObject.type === "dateRange") {
			if (filterElement) {
				var valuesFromString = filterObject.getValuesFromString(filterElement.querySelector(".value").textContent);
			}
			dialog.prompt(
				"Select Date Range",
				"Select dates in order to filter by " + filterObject.label.toLowerCase() + ".",
				{
					fields: filterObject.values.map((value, index) => {
						return {
							type: "date",
							label: value.label,
							defaultValue: (valuesFromString ? valuesFromString[index] : value.defaultValue),
							required: value.required,
						};
					}),
					cancellable: true,
				}
			).then((response) => {
				if (response.type === "input") {
					if (filterElement) {
						filterElement.querySelector(".value").textContent = filterObject.getStringFromValues(response.values);
						this.refreshResults();
					} else {
						this.addFilter(filterObject, filterObject.getStringFromValues(response.values));
					}
				}
			})
		}
	};
	this.element.querySelector(".addFilter").onclick = this.presentFilterSelect.bind(this);

	this.addFilter = function (filterObject, selectedOption) {
		var thisInstance = this;

		var filterElement = document.createElement("div");
		filterElement.classList.add("filter");
		filterElement.classList.add(filterObject.id);

		var filterIcon = document.createElement("div");
		filterIcon.classList.add("iconContainer");
		filterIcon.innerHTML = `
			<iconify-icon icon="${filterObject.icon}"></iconify-icon>
		`;
		filterIcon.title = filterObject.label;
		filterIcon.onclick = function (e) {
			notification.addToQueue(
				"passive",
				filterObject.icon,
				filterObject.label,
				"Filter by " + filterObject.label.toLowerCase()
			)
		};

		var filterValueElement = document.createElement("p");
		filterValueElement.classList.add("value");
		filterValueElement.textContent = selectedOption;
		filterValueElement.onclick = function (e) {
			thisInstance.presentFilterValueSelect(e, filterObject, filterElement);
		};

		var removeButton = document.createElement("div");
		removeButton.classList.add("removeButton");
		removeButton.innerHTML = "<iconify-icon icon='mdi:close'></iconify-icon>";
		removeButton.addEventListener("click", function () {
			filterObject.disabled = false;
			filterElement.parentElement.removeChild(filterElement);
			thisInstance.refreshResults();
		});

		filterElement.appendChild(filterIcon);
		filterElement.appendChild(filterValueElement);
		filterElement.appendChild(removeButton);
		this.element.querySelector(".filters").appendChild(filterElement);

		var filterCount = this.element.querySelectorAll(
			".filters .filter." + filterObject.id
		).length;
		filterObject.disabled = filterObject.max === filterCount;

		this.refreshResults();
	}

	this.showMatchSelection = function () {
		var defaultMatch = ["name", "description", "visible_content"];
		var labels = ["Name", "Description", "Visible Content", "Tags"];
		var options = ["name", "description", "visible_content", "tags"];
		dialog.list(
			"Match",
			"Choose which item properties to search in.",
			labels.map((label) => {
				return {
					label: label,
				};
			}),
			{
				cancellable: true,
				immediate: true,
				allowMultiple: true,
				preselectedIndexes: this.match.map((option) => {
					return options.indexOf(option);
				}),
			}
		).then((response) => {
			if (response.type === "listSelection") {
				this.match = [];
				for (var i = 0; i < response.indexes.length; i++) {
					this.match.push(options[response.indexes[i]]);
				}
				if (this.match !== defaultMatch) {
					this.element.querySelector(".match").classList.add("active");
				} else {
					this.element.querySelector(".match").classList.remove("active");
				}
				this.refreshResults();
			}
		});
	};
	this.element.querySelector(".match").addEventListener("click", this.showMatchSelection.bind(this));

	this.showSortBySelection = function () {
		var defaultSortBy = "name";
		var labels = [
			"Name",
			"Scene",
			"Date Added (Newest First)",
			"Date Added (Oldest First)",
		];
		var values = [
			"name",
			"scene",
			"newest_first",
			"oldest_first",
		]
		dialog.list(
			"Sort By",
			"Choose how to sort the results.",
			labels.map((label) => {
				return {
					label: label,
				};
			}),
			{
				cancellable: true,
				immediate: true,
				preselectedIndexes: [values.indexOf(this.sortBy)],
			}
		).then((response) => {
			if (response.type === "listSelection") {
				this.sortBy = values[response.index];
				if (this.sortBy !== defaultSortBy) {
					this.element.querySelector(".sortBy").classList.add("active");
				} else {
					this.element.querySelector(".sortBy").classList.remove("active");
				}
				this.refreshResults();
			}
		});
	}
	this.element.querySelector(".sortBy").onclick = this.showSortBySelection.bind(this);

	this.searchBar = {
		timeoutID: null,
		oninput: function (e) {
			if (this.searchBar.timeoutID) {
				clearTimeout(this.searchBar.timeoutID);
			}

			this.element
				.querySelector(".databaseBrowser .loadingContainer")
				.classList.remove("hidden");
			this.element
				.querySelector(".databaseBrowser .resultsContainer")
				.classList.add("hidden");
			this.element
				.querySelector(".databaseBrowser .errorMessageContainer")
				.classList.add("hidden");

			//Wait a second before updating the search results
			this.timeoutID = setTimeout(this.refreshResults.bind(this), 1000);

			e.stopPropagation();
		},
		onchange: function (e) {
			this.refreshResults();
			e.stopPropagation();
		},
		onkeydown: function (e) {
			e.stopPropagation();
		},
	};
	this.element.querySelector(".searchField input").oninput = this.searchBar.oninput.bind(this);
	this.element.querySelector(".searchField input").onchange = this.searchBar.onchange.bind(this);
	this.element.querySelector(".searchField input").onkeydown = this.searchBar.onkeydown.bind(this);

	this.refreshResults = function (mode) {
		if (this.abortController) {
			this.abortController.abort();
		}

		var PHPParams = "";
		var character = "?";

		var searchInput = this.element.querySelector(".searchField input");
		if (searchInput.value.length > 0) {
			PHPParams += character + "query=" + searchInput.value;
			character = "&";
		}

		var activeFilters = this.element.querySelectorAll(
			".filters .filter"
		);
		for (var i = 0; i < activeFilters.length; i++) {
			var currentFilter = activeFilters[i];
			var filterID = currentFilter.classList[1];

			var filterObject = this.filters.find((filter) => {
				return filter.id === filterID;
			});

			//If the filter isn't a hidden filter, get the selected value
			var filterValue = currentFilter.querySelector(".value").textContent;
			if (filterValue === "") {
				continue;
			}

			if (filterObject.parameterValues) {
				filterValue = filterObject.parameterValues[filterObject.values.indexOf(filterValue)];
			}

			if (filterObject.parameterName) {
				PHPParams += character + filterObject.parameterName + "=";
			} else {
				PHPParams += character + filterObject.id + "=";
			}
			if (filterObject.valueCase === "lower") {
				PHPParams += filterValue.toLowerCase();
			} else {
				PHPParams += filterValue;
			}
			character = "&";
		}

		PHPParams += character + "match=" + this.match.join(",");
		character = "&";
		PHPParams += character + "sort_by=" + this.sortBy;

		if (!mode) {
			this.searchRange.min = 1;
			this.searchRange.max = 21;
		} else if (mode === "refreshExisting") {
			var previousMin = this.searchRange.min;
			this.searchRange.min = 1;
		}

		//Fetch new results
		this.abortController = new AbortController();
		fetch(
			"/api/search/" +
				PHPParams +
				character +
				"min=" +
				this.searchRange.min +
				"&max=" +
				this.searchRange.max,
				{
					signal: this.abortController.signal,
				}
		)
			.then((response) => response.json())
			.then(
				(data) => {
					// Get current scroll position
					if (mode === "refreshExisting") {
						var scrollPosition = this.element.querySelector(
							".resultsContainer"
						).scrollTop;
					}

					if (mode !== "preservePreviousResults") {
						//Clear the current results from .resultsContainer
						while (
							this.element.querySelector(".resultsContainer").firstChild
						) {
							this.element.querySelector(".resultsContainer")
								.removeChild(
									this.element.querySelector(".resultsContainer").firstChild
								);
						}
					}
					if (mode !== "preservePreviousResults" && data.search_results.length === 0) {
						var noResults = document.createElement("div");
						noResults.className = "noResults";
						noResults.innerHTML = `
							<div class="iconContainer">
								<iconify-icon icon="mdi:bee" width="48"></iconify-icon>
							</div>
							<h2>There's Nothing In Here But Bees!</h2>
							<p>We couldn't find any results.</p>
						`;
						this.element.querySelector(".resultsContainer").appendChild(noResults);
					} else if (mode === "preservePreviousResults" && data.search_results.length === 0) {
						var loadMoreButton = this.element.querySelector(
							".loadMoreButton"
						);
						loadMoreButton.parentElement.removeChild(
							loadMoreButton
						);
					} else {
						if (mode === "preservePreviousResults") {
							var loadMoreButton = this.element.querySelector(
								".loadMoreButton"
							);
							loadMoreButton.parentElement.removeChild(
								loadMoreButton
							);
						}

						for (var i = 0; i < data.search_results.length; i++) {
							var currentItemData = data.search_results[i];
							var item = new ItemCard(
								currentItemData,
								{
									onclick: (options?.adminMode === true) ? "edit" : "open"
								}
							);
							if (options?.select === true) {
								(function (item) {
									item.element.onclick = (e) => {
										this.selectItem(item);
										e.preventDefault();
										e.stopPropagation();
									};
								}.bind(this))(item)
								if (this.selectedItems.includes(item.id)) {
									item.element.classList.add("selected");
								}
							}
							this.element
								.querySelector(
									".resultsContainer"
								)
								.appendChild(item.element);
						}

						if (
							data.search_results.length ===
							this.searchRange.max - this.searchRange.min
						) {
							var loadMoreButton = document.createElement("button");
							loadMoreButton.className = "loadMoreButton";
							loadMoreButton.textContent = "Load More";
							loadMoreButton.addEventListener(
								"click",
								this.loadMoreResults.bind(this)
							);
							this.element
								.querySelector(
									".resultsContainer"
								)
								.appendChild(loadMoreButton);
						}
					}

					// Restore scroll position
					if (scrollPosition) {
						this.element.querySelector(".resultsContainer").scrollTop = scrollPosition;
					}

					if (previousMin) {
						this.searchRange.min = previousMin;
					}

					//Hide the loading screen and show the results container
					this.element
						.querySelector(".loadingContainer")
						.classList.add("hidden");
					this.element
						.querySelector(".resultsContainer")
						.classList.remove("hidden");
					this.element
						.querySelector(
							".errorMessageContainer"
						)
						.classList.add("hidden");
				},
				(error) => {
					this.element.querySelector(
						".errorMessageContainer .title"
					).textContent = "Something Went Wrong";
					this.element.querySelector(
						".errorMessageContainer .subtitle"
					).textContent = "Failed to load database items.";

					//Hide the loading screen and show the error message container
					this.element
						.querySelector(".loadingContainer")
						.classList.add("hidden");
					this.element
						.querySelector(".resultsContainer")
						.classList.add("hidden");
					this.element
						.querySelector(
							".errorMessageContainer"
						)
						.classList.remove("hidden");
				}
			);
	}
		
	this.loadMoreResults = function () {
		this.searchRange.min += 20;
		this.searchRange.max += 20;
		this.refreshResults("preservePreviousResults");
	}

	this.refreshResults();

	refreshableDatabaseBrowsers.push(this);

	//Load available tags
	fetch("/api/tags/")
		.then((request) => request.json())
		.then((data) => {
			this.filters[3] = {
				id: "tags",
				parameterName: "tags[]",
				icon: "mdi:tag",
				label: "Tag",
				type: "list",
				values: ["UNTAGGED"].concat(data),
				max: data.length,
			};
		});

	//Load available authors
	fetch("/api/authors/")
		.then((request) => request.json())
		.then((data) => {
			this.filters[4] = {
				id: "author",
				parameterName: "author",
				icon: "mdi:user",
				label: "Author",
				type: "list",
				values: data.map((author) => {
					// Check author for [link.com] and remove it
					var authorLinkIndex = author.indexOf("[");
					if (authorLinkIndex !== -1) {
						return author.substring(0, authorLinkIndex) + " (" + author.substring(authorLinkIndex + 1, author.length - 1) + ")";
					}
				}),
				max: 1,
			};
		});
}

function Item(item, options) {
	// Create the element
	this.element = document.createElement("div");
	this.element.className = "itemCard";

	var loadingContainer = document.createElement("div");
	loadingContainer.className = "loadingContainer";
	loadingContainer.innerHTML = `
		<div class="loadingAnimationEllipsis">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	`;
	this.element.appendChild(loadingContainer);

	var rightSideContainer =
		document.createElement("div");
	rightSideContainer.className = "right";
	this.element.appendChild(rightSideContainer);

	var sceneElement = document.createElement("p");
	sceneElement.className = "scene";

	var nameElement = document.createElement("h3");
	nameElement.className = "name";
	nameElement.textContent = "Loading..."

	var infoContainerElement =
		document.createElement("div");
	infoContainerElement.className = "infoContainer";

	var parkElement = document.createElement("p");
	parkElement.className = "park";
	infoContainerElement.appendChild(parkElement);

	var typeElement = document.createElement("p");
	typeElement.className = "type";
	infoContainerElement.appendChild(typeElement);

	var authorElement = document.createElement("p");
	authorElement.className = "author";
	infoContainerElement.appendChild(authorElement);

	rightSideContainer.appendChild(sceneElement);
	rightSideContainer.appendChild(nameElement);
	rightSideContainer.appendChild(infoContainerElement);

	this.element.appendChild(rightSideContainer);

	// If the item is a string, assume it is an id and fetch the item
	if (typeof item === "string") {
		fetch("/api/item/" + item)
			.then((request) => request.json())
			.then((data) => {
				item = data;
				populateCard.bind(this)();
			});
	} else {
		populateCard.bind(this)();
	}

	function populateCard () {
		// For each item property, create a property on the item object
		for (var key in item) {
			this[key] = item[key];
		}

		if (options && options.static) {
			this.element.classList.add("static");
		} else {
			(function (element, id) {
				element.onclick = function () {
					showItemDetails(id);
				};
			})(this.element, item.id);
		}

		if (item.type === "image") {
			var pictureElement = null;
			var imgElement = document.createElement("img");
			imgElement.className = "image";
			imgElement.src = "/resources/" + item.image + "/thumbnail.jpg";
		} else if (item.type === "video") {
			var pictureElement = null;
			var imgElement = document.createElement("img");
			imgElement.className = "image";
			imgElement.src =
				"https://img.youtube.com/vi/" +
				item.video_id +
				"/mqdefault.jpg";
		} else {
			var pictureElement =
				document.createElement("picture");
			pictureElement.className = "image";

			var sourceElement =
				document.createElement("source");
			sourceElement.srcset =
				"/images/icons/types/" +
				item.type +
				"-white.png";
			sourceElement.setAttribute(
				"media",
				"(prefers-color-scheme: dark)"
			);

			var imgElement = document.createElement("img");
			imgElement.src =
				"/images/icons/types/" +
				item.type +
				"-black.png";

			pictureElement.appendChild(sourceElement);
			pictureElement.appendChild(imgElement);
		}

		sceneElement.textContent = item.scene;
		nameElement.textContent = item.name;
		parkElement.textContent = item.park;
		typeElement.textContent = item.type;
		if (item.author) {
			authorElement.textContent =
			item.author.replace(
				/\[([^\][]+)]/g,
				""
			);
		} else {
			authorElement.parentElement.removeChild(authorElement);
		}


		if (pictureElement) {
			this.element.insertBefore(pictureElement, loadingContainer);
		} else if (imgElement) {
			this.element.insertBefore(imgElement, loadingContainer);
		}
		this.element.removeChild(loadingContainer);
	}
}

function ItemCard(item, options) {
	// Create the element
	this.element = document.createElement("div");
	this.element.className = "itemCardNEW";

	var loadingContainer = document.createElement("div");
	loadingContainer.className = "loadingContainer";
	loadingContainer.innerHTML = `
		<div class="loadingAnimationEllipsis">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	`;
	this.element.appendChild(loadingContainer);

	var rightSideContainer =
		document.createElement("div");
	rightSideContainer.className = "right";
	this.element.appendChild(rightSideContainer);

	var locationContaianer = document.createElement("div");
	locationContaianer.classList.add("locationContainer");
	locationContaianer.classList.add("hidden");
	rightSideContainer.appendChild(locationContaianer);

	var parkContainer = document.createElement("div");
	locationContaianer.appendChild(parkContainer);

	var parkIcon = document.createElement("iconify-icon");
	parkIcon.icon = "material-symbols:push-pin";
	parkContainer.appendChild(parkIcon);

	var parkValue = document.createElement("span");
	parkValue.classList.add("park");
	parkContainer.appendChild(parkValue);

	var sceneContainer = document.createElement("div");
	locationContaianer.appendChild(sceneContainer);

	var sceneIcon = document.createElement("iconify-icon");
	sceneIcon.icon = "material-symbols:pin-drop";
	sceneContainer.appendChild(sceneIcon);

	var sceneValue = document.createElement("span");
	sceneValue.classList.add("scene");
	sceneContainer.appendChild(sceneValue);

	var nameElement = document.createElement("h3");
	nameElement.className = "name";
	nameElement.textContent = "Loading...";
	rightSideContainer.appendChild(nameElement);

	var authorContainer = document.createElement("div");
	authorContainer.classList.add("authorContainer");
	authorContainer.classList.add("hidden");
	rightSideContainer.appendChild(authorContainer);

	var authorIcon = document.createElement("iconify-icon");
	authorIcon.icon = "mdi:user";
	authorContainer.appendChild(authorIcon);

	var authorValue = document.createElement("p");
	authorValue.className = "author";
	authorContainer.appendChild(authorValue);

	this.element.appendChild(rightSideContainer);

	// If the item is a string, assume it is an id and fetch the item
	if (typeof item === "string") {
		fetch("/api/item/" + item)
			.then((request) => request.json())
			.then((data) => {
				item = data;
				populateCard.bind(this)();
			});
	} else {
		populateCard.bind(this)();
	}

	function populateCard () {
		// For each item property, create a property on the item object
		for (var key in item) {
			this[key] = item[key];
		}

		if (options?.static) {
			this.element.classList.add("static");
		} else {
			(function (element, id) {
				if (options.onclick === "edit") {
					element.onclick = function () {
						showDatabaseItemEditor(id);
					};
				} else {
					element.onclick = function () {
						showItemDetails(id);
					};
				}
			})(this.element, item.id);
		}

		var thumbnailElement;
		if (item.type === "image") {
			thumbnailElement = document.createElement("img");
			thumbnailElement.className = "image";
			thumbnailElement.src = "/resources/" + item.image + "/thumbnail.jpg";
		} else if (item.type === "video") {
			thumbnailElement = document.createElement("div");
			thumbnailElement.classList.add("imageContainer");

			var imgElement = document.createElement("img");
			imgElement.className = "image";
			imgElement.src =
				"https://img.youtube.com/vi/" +
				item.video_id +
				"/mqdefault.jpg";
			thumbnailElement.appendChild(imgElement);

			var playIcon = document.createElement("iconify-icon");
			playIcon.icon = "mdi:play";
			thumbnailElement.appendChild(playIcon);
		} else {
			thumbnailElement = document.createElement("div");
			thumbnailElement.classList.add("iconContainer");
			
			var iconElement = document.createElement("iconify-icon");
			iconElement.width = 48;
			switch (item.type) {
				case "audio":
					iconElement.icon = "mdi:headphones";
					break;
				case "date":
					iconElement.icon = "mdi:calendar";
					break;
				case "text":
					iconElement.icon = "mdi:file-document";
					break;
			}
			thumbnailElement.appendChild(iconElement);
		}
		this.element.insertBefore(thumbnailElement, loadingContainer);

		locationContaianer.classList.remove("hidden");
		parkValue.textContent = item.park;
		sceneValue.textContent = item.scene;
		nameElement.textContent = item.name;
		if (item.author) {
			authorValue.textContent =
			item.author.replace(
				/\[([^\][]+)]/g,
				""
			);
			authorContainer.classList.remove("hidden");
		} else {
			authorValue.parentElement.removeChild(authorValue);
		}

		this.element.removeChild(loadingContainer);
	}
}

var dialog = {
	queue: [],
	isRendering: false,
	addToQueue: async function (type, title, message, options) {
		return new Promise(function (resolve, reject) {
			dialog.queue.push([type, title, message, options, resolve, reject]);

			// If options.immediate is true, hide the current dialog and show the new one
			if (options.immediate && document.querySelector(".dialog")) {
				document.querySelector(".dialog").classList.add("hidden");
				dialog.render(
					type,
					title,
					message,
					options,
					function (value) {
						//Run the dialog's resolve function
						resolve(value);
						//Show the previous dialog again
						dialog.queue.pop();
						document.querySelector(".dialog").classList.remove("hidden");
					},
					function (value) {
						//Run the dialog's reject function
						reject(value);
						//Show the previous dialog again
						dialog.queue.pop();
						document.querySelector(".dialog").classList.remove("hidden");
					}
				);
			} else if (!dialog.isRendering) {
				dialog.renderLoop();
				return;
			}
		});
	},
	renderLoop: function () {
		dialog.isRendering = true;
		var next = dialog.queue[0];
		if (next) {
			dialog.render(
				next[0], // Type
				next[1], // Title
				next[2], // Message
				next[3], // Options
				function (value) {
					//Run the dialog's resolve function
					next[4](value);
					//Continue the queue
					dialog.queue.shift();
					setTimeout(dialog.renderLoop, 200);
				},
				function (value) {
					//Run the dialog's reject function
					next[5](value);
					//Continue the queue
					dialog.queue.shift();
					setTimeout(dialog.renderLoop, 200);
				}
			);
		} else {
			dialog.isRendering = false;
		}
	},
	render: function (type, title, message, options, resolve, reject) {
		var dialogElement = document.createElement("div");
		dialogElement.classList.add("dialog");
		dialogElement.classList.add("hidden");
		dialogElement.innerHTML = `
            <h1 class="title">${title}</h1>
            <p class="message">${message}</p>
        `;

		if (type === "list") {
			var listContainer = document.createElement("div");
			listContainer.className = "listContainer";

			var searchBar = document.createElement("input");
			searchBar.type = "text";
			searchBar.placeholder = "Filter...";
			searchBar.className = "searchBar";
			searchBar.oninput = function () {
				var items = listContainer.querySelectorAll(".item");
				for (var i = 0; i < items.length; i++) {
					if (
						items[i].children[0].textContent.toLowerCase().includes(searchBar.value.toLowerCase()) ||
						(
							items[i].children[1] &&
							items[i].children[1].textContent.toLowerCase().includes(searchBar.value.toLowerCase())
						)
					) {
						items[i].classList.remove("hidden");
					} else {
						items[i].classList.add("hidden");
					}
				}
			};
			listContainer.appendChild(searchBar);

			var list = document.createElement("div");
			list.className = "list";
			listContainer.appendChild(list);

			for (var i = 0; i < options.content.length; i++) {
				(function (i) {
					var item = document.createElement("div");
					item.classList.add("item");
					if (options.preselectedIndexes && options.preselectedIndexes.includes(i)) {
						item.classList.add("selected");
					}
					if (options.allowMultiple) {
						item.addEventListener("click", function () {
							item.classList.toggle("selected");
						});
					} else {
						item.addEventListener("click", function () {
							dialog.callbacks.dismiss(dialogElement);
							resolve({
								type: "listSelection",
								index: i,
							});
						});
					}

					var label = document.createElement("p");
					label.className = "label";
					label.textContent = options.content[i].label;
					item.appendChild(label);

					if (options.content[i].sublabel) {
						var sublabel = document.createElement("p");
						sublabel.className = "sublabel";
						sublabel.textContent = options.content[i].sublabel;
						item.appendChild(sublabel);
					}

					list.appendChild(item);
				})(i);
			}

			dialogElement.appendChild(listContainer);
		}

		if (type === "prompt") {
			var fieldValueGetters = [];
			if (options.placeholders) {
				//Create multiple inputs
				for (var i = 0; i < options.placeholders.length; i++) {
					var input = document.createElement("input");
					input.type = "text";
					input.placeholder = options.placeholders[i];
					input.className = "input";
					(function (input) {
						fieldValueGetters.push(function () {
							return input.value;
						});
					})(input);
					dialogElement.appendChild(input);
				}
			} else if (options.fields) {
				for (var i = 0; i < options.fields.length; i++) {
					switch (options.fields[i].type) {
						case "text":
							var input = document.createElement("input");
							input.type = "text";
							input.placeholder = options.fields[i].placeholder;
							input.className = "input";
							(function (input) {
								fieldValueGetters.push(function () {
									return input.value;
								});
							})(input);
							dialogElement.appendChild(input);
							break;
						case "textarea":
							var input = document.createElement("textarea");
							input.placeholder = options.fields[i].placeholder;
							input.className = "input";
							(function (input) {
								fieldValueGetters.push(function () {
									return input.value;
								});
							})(input);
							dialogElement.appendChild(input);
							break;
						case "date":
							var input = document.createElement("input");
							input.type = "date";
							input.placeholder = options.fields[i].placeholder;
							if (options.fields[i].defaultValue) {
								input.value = options.fields[i].defaultValue;
							}
							input.className = "input";
							(function (input) {
								fieldValueGetters.push(function () {
									return input.value;
								});
							})(input);
							dialogElement.appendChild(input);
							break;
						case "item":
							var databaseBrowser = new DatabaseBrowser({
								select: true,
								preselectedItems: options.fields[i].preselectedItems,
							});
							dialogElement.classList.add("expanded");
							(function (browser) {
								fieldValueGetters.push(function () {
									return browser.selectedItems;
								});
							})(databaseBrowser);
							dialogElement.appendChild(databaseBrowser.element);
							break;
					}
				}
			} else {
				//Create a single input
				var input = document.createElement("input");
				input.type = "text";
				if (options.placeholder) {
					input.placeholder = options.placeholder;
				}
				input.className = "input";
				(function (input) {
					fieldValueGetters.push(function () {
						return input.value;
					});
				})(input);
				dialogElement.appendChild(input);
			}
		}

		var buttonContainer = document.createElement("div");
		buttonContainer.className = "buttonContainer";
		dialogElement.appendChild(buttonContainer);

		if (type !== "alert") {
			if (options && options.cancellable) {
				buttonContainer.appendChild(
					dialog.createButton("Cancel", "passive", function () {
						dialog.callbacks.dismiss(dialogElement);
						reject();
					})
				);
			}
		}

		switch (type) {
			case "alert":
				buttonContainer.appendChild(
					dialog.createButton("Done", "primary", function () {
						dialog.callbacks.dismiss(dialogElement);
						resolve();
					})
				);
				break;
			case "confirm":
			case "list":
				if (options.buttons && options.buttons.length > 0) {
					for (var i = 0; i < options.buttons.length; i++) {
						(function (i) {
							buttonContainer.appendChild(
								dialog.createButton(options.buttons[i].text, options.buttons[i].type, function () {
									dialog.callbacks.dismiss(dialogElement);
									resolve({
										type: "buttonSelection",
										index: i,
									});
								})
							);
						})(i);
					}
				}
				if (type === "list" && options.allowMultiple) {
					buttonContainer.appendChild(
						dialog.createButton("Done", "active", function () {
							dialog.callbacks.dismiss(dialogElement);
							var selectedItems = dialogElement.querySelectorAll(".item.selected");
							var indexes = [];
							for (var i = 0; i < selectedItems.length; i++) {
								indexes.push(Array.prototype.indexOf.call(selectedItems[i].parentNode.children, selectedItems[i]));
							}
							resolve({
								type: "listSelection",
								indexes: indexes,
							});
						})
					);
				}
				break;
			case "prompt":
				buttonContainer.appendChild(
					dialog.createButton("Done", "active", function () {
						dialog.callbacks.dismiss(dialogElement);
						fieldValueGetters = fieldValueGetters.map(function (getter) {
							return getter();
						});
						resolve({
							type: "input",
							values: fieldValueGetters,
						});
					})
				);
				break;
		}

		function keydownListener(e) {
			switch (e.key) {
				case "Enter":
					buttonContainer.children[buttonContainer.children.length - 1].click();
					break;
				case "Escape":
					if (type !== "alert") {
						dialog.callbacks.dismiss(dialogElement);
						reject();
					}
					break;
			}
			e.stopPropagation();
			document.body.removeEventListener("keydown", keydownListener);
		}
		document.body.addEventListener("keydown", keydownListener);

		document.body.insertBefore(dialogElement, document.querySelector(".overlay"));
		requestAnimationFrame(function () {
			dialogElement.classList.remove("hidden");

			var inputs = dialogElement.querySelectorAll("input");
			if (inputs.length > 0) {
				inputs[0].focus();
			} else if (searchBar) {
				searchBar.focus();
			}
		});
	},

	callbacks: {
		dismiss: function (dialogElement) {
			if (dialog.queue.length > 1) {
				document.querySelector(".overlay").classList.add("show");
			} else {
				document.querySelector(".overlay").classList.remove("show");
			}

			dialogElement.classList.add("hidden");
			setTimeout(function () {
				dialogElement.parentElement.removeChild(dialogElement);
			}, 200);
		},
	},
	confirm: function (title, message, options) {
		return this.addToQueue("confirm", title, message, options);
	},
	prompt: function (title, message, options) {
		return this.addToQueue("prompt", title, message, options);
	},
	alert: function (title, message, options) {
		return this.addToQueue("alert", title, message, options);
	},
	list: function (title, message, content, options) {
		if (options) {
			options.content = content;
		} else {
			options = {
				content: content,
			};
		}
		return this.addToQueue("list", title, message, options);
	},
	createButton: function (text, type, callback) {
		var button = document.createElement("button");
		button.textContent = text;
		button.classList.add(type);
		button.addEventListener("click", callback);
		return button;
	},
};

var notification = {
	queue: [],
	isRendering: false,
	addToQueue: async function (type, icon, title, message, options) {
		return new Promise(function (resolve, reject) {
			notification.queue.push([type, icon, title, message, options, resolve, reject]);

			if (!notification.isRendering) {
				notification.renderLoop();
				return;
			}
		});
	},
	renderLoop: function () {
		notification.isRendering = true;
		var next = notification.queue[0];
		if (next) {
			notification.render(
				next[0], // Type
				next[1], // Icon
				next[2], // Title
				next[3], // Message
				next[4], // Options
				function (value) {
					//Run the notification's resolve function
					next[5](value);
					//Continue the queue
					notification.queue.shift();
					setTimeout(notification.renderLoop, 200);
				}
			);
		} else {
			notification.isRendering = false;
		}
	},
	render: function (type, icon, title, message, options, resolve, reject) {
		var notificationElement = document.createElement("div");
		notificationElement.classList.add("notification");
		notificationElement.classList.add("hidden");
		if (type) {
			notificationElement.classList.add(type);
		}
		notificationElement.innerHTML = `
			<div class="icon">
				<iconify-icon icon="${icon}"></iconify-icon>
			</div>
			<div class="content">
				<p class="title">${title}</p>
				<p class="message">${message}</p>
			</div>
		`;

		document.body.insertBefore(notificationElement, document.querySelector(".overlay"));
		requestAnimationFrame(function () {
			document.querySelector(".notification").classList.remove("hidden");
		});

		setTimeout(function () {
			notificationElement.classList.add("hidden");
			setTimeout(function () {
				notificationElement.parentElement.removeChild(notificationElement);
				resolve();
			}, 500);
		}, options?.duration || 3000);
	},

	show: function (type, icon, title, message, options) {
		return this.addToQueue(type, icon, title, message, options);
	}
};

var contextMenu = {
	present: function (options) {
		//Clear previous menu if present
		var previousMenu = document.querySelector(".contextMenu");
		if (previousMenu) {
			contextMenu.callbacks.dismiss();
		}

		var container = document.createElement("div");
		container.classList.add("contextMenu");
		container.classList.add("hidden");

		var items = options.items;
		for (var i = 0; i < items.length; i++) {
			var button = document.createElement("div");
			if (items[i].type) {
				button.classList.add(items[i].type);
			}
			if (items[i].disabled) {
				button.classList.add("disabled");
			} else {
				(function (i) {
					button.addEventListener("click", function (e) {
						items[i].callback(e);
						contextMenu.callbacks.dismiss();
					});
				})(i);
			}
			
			if (items[i].icon) {
				var iconContainer = document.createElement("div");
				iconContainer.classList.add("icon");
				var icon = document.createElement("iconify-icon");
				icon.icon = items[i].icon;
				iconContainer.appendChild(icon);
				button.appendChild(iconContainer);
			}

			var textContainer = document.createElement("p");
			textContainer.textContent = items[i].label;
			button.appendChild(textContainer);

			container.appendChild(button);
		}

		document.body.insertBefore(container, document.querySelector(".overlay"));

		//Calculate visible position of the context menu and adjust to fit on screen
		var x = options.x;
		var y = options.y;
		var width = container.offsetWidth;
		var height = container.offsetHeight;
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		if (x + width > windowWidth) {
			if (x - width > 0) {
				x -= width;
			} else {
				x = windowWidth - width - 10;
			}
		}
		if (y + height > windowHeight) {
			if (y - height > 0) {
				y -= height;
			} else {
				y = windowHeight - height - 10;
			}
		}
		container.style.left = x + "px";
		container.style.top = y + "px";

		requestAnimationFrame(function () {
			container.classList.remove("hidden");
			//Dismiss menu when clicking outside of it
			var dismiss = function (e) {
				if (e.target && e.target.closest && e.target.closest(".contextMenu")) {
					return;
				}
				container.classList.add("hidden");
				setTimeout(function () {
					if (container && container.parentElement) {
						container.parentElement.removeChild(container);
					}
				}, 200);
				document.removeEventListener("click", dismiss);
				window.removeEventListener("scroll", dismiss);
			}
			document.addEventListener("click", dismiss);
			window.addEventListener("scroll", dismiss);
		});
	},
	callbacks: {
		dismiss: function () {
			var menu = document.querySelector(".contextMenu");
			menu.classList.add("hidden");
			setTimeout(function () {
				if (menu && menu.parentElement) {
					menu.parentElement.removeChild(menu);
				}
			}, 200);
		}
	}
};