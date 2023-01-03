function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Components
function DatabaseBrowser(options) {
	this.element = document.createElement("div");
	this.element.classList.add("databaseBrowser");
	this.element.innerHTML = /*html*/`
		<div class="searchControls">
			<div class="searchField">
				<input type="text" placeholder="Search">
			</div>

			<button class="match">
				<i class="gg-search-found"></i>
				<span>Match</span>
			</button>

			<button class="sortBy">
				<i class="gg-sort-az"></i>
				<span>Sort By</span>
			</button>

			<button class="addFilter">
				<i class="gg-math-plus"></i>
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
			id: "park",
			icon: "pin",
			label: "Park",
			values: ["WDW", "DL", "TDL"],
			max: 1,
		},
		{
			id: "type",
			icon: "attachment",
			label: "Type",
			values: ["image", "video", "audio", "text", "date"],
			max: 1,
		},
		{
			id: "author",
			icon: "user",
			label: "Author",
			hidden: true,
		},
		{
			id: "scene",
			icon: "pin-alt",
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
	this.match = ["name", "description", "visible_content"];
	this.sortBy = "name";
	this.abortController = null;
	this.searchRange = {
		min: 1,
		max: 21,
	};

	this.presentFilterSelect = function (e) {
		var items = this.filters.filter((filter) => !filter.hidden);
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
	this.presentFilterValueSelect = function (e, filterObject) {
		if (filterObject.values.length > 10) {
			dialog.list(
				"Select " + filterObject.label,
				"Select a " + filterObject.label.toLowerCase() + " to filter by.",
				filterObject.values.map((value) => {
					return {
						label: value
					};
				}),
				{
					cancellable: true,
				}
			).then((response) => {
				if (response.type === "listSelection") {
					this.addFilter(filterObject, filterObject.values[response.index]);
				}
			});
		} else {
			contextMenu.present({
				x: e.clientX,
				y: e.clientY,
				items: filterObject.values.map((value) => {
					return {
						label: value,
						callback: () => {
							this.addFilter(filterObject, value);
						},
					};
				}),
			})
		}
	};
	this.element.querySelector(".addFilter").onclick = this.presentFilterSelect.bind(this);

	this.updateDisabledFilters = function (id) {
		//Get current values of identical filters
		var values = [];
		var filters = this.element.querySelectorAll(".filter." + id);
		for (var i = 0; i < filters.length; i++) {
			var select = filters[i].querySelector("select");
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

	this.addFilter = function (filterObject, selectedOption) {
		var thisInstance = this;

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
				thisInstance.updateDisabledFilters(filterObject.id);
				thisInstance.refreshResults();
			});
			//Get current values of identical filters
			var currentlyUsedValues = [];
			var currentlyUsedFilters = document.querySelectorAll(
				".filter." + filterObject.id
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
		removeButton.innerHTML = "<i class='gg-close'></i>";
		removeButton.addEventListener("click", function () {
			filterObject.disabled = false;
			filterElement.parentElement.removeChild(filterElement);
			thisInstance.refreshResults();
		});

		filterElement.appendChild(filterName);
		if (!filterObject.hidden) {
			filterElement.appendChild(filterSelect)
		} else {
			filterElement.appendChild(filterValueDisplay);
		}
		filterElement.appendChild(removeButton);
		this.element.querySelector(".filters").appendChild(filterElement);

		var filterCount = this.element.querySelectorAll(
			".filters .filter." + filterObject.id
		).length;
		filterObject.disabled = filterObject.max === filterCount;

		if (!filterObject.hidden) this.updateDisabledFilters(filterObject.id);
		this.refreshResults();
	}

	this.showMatchSelection = function () {
		var options = ["name", "description", "visible_content"];
		dialog.list(
			"Match",
			"Choose which item properties to search in.",
			options.map((option) => {
				return {
					label: option,
				};
			}),
			{
				cancellable: true,
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
				this.refreshResults();
			}
		});
	};
	this.element.querySelector(".match").addEventListener("click", this.showMatchSelection.bind(this));

	this.showSortBySelection = function () {
		dialog.list(
			"Sort By",
			"Choose how to sort the results.",
			[
				"Name",
				"Scene",
				"Date Added (Newest First)",
				"Date Added (Oldest First)",
			].map((option) => {
				return {
					label: option,
				};
			}),
			{
				cancellable: true,
			}
		).then((response) => {
			if (response.type === "listSelection") {
				switch (response.index) {
					case 0:
						this.sortBy = "name";
						break;
					case 1:
						this.sortBy = "scene";
						break;
					case 2:
						this.sortBy = "newest_first";
						break;
					case 3:
						this.sortBy = "oldest_first";
						break;
				}
				this.refreshResults();
			}
		});
	}
	this.element.querySelector(".sortBy").onclick = this.showSortBySelection.bind(this);

	this.searchBar = {
		timeoutID: null,
		oninput: function () {
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
		},
		onchange: function () {
			this.refreshResults();
		},
	};
	this.element.querySelector(".searchField input").oninput = this.searchBar.oninput.bind(this);
	this.element.querySelector(".searchField input").onchange = this.searchBar.onchange.bind(this);

	this.refreshResults = function (preservePreviousResults) {
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

			var parameterName;
			var valueCase;
			for (var j = 0; j < this.filters.length; j++) {
				if (this.filters[j].id === filterID) {
					parameterName = this.filters[j].parameterName;
					valueCase = this.filters[j].valueCase;
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

		PHPParams += character + "match=" + this.match.join(",");
		PHPParams += character + "sort_by=" + this.sortBy;
		character = "&";

		if (!preservePreviousResults) {
			this.searchRange.min = 1;
			this.searchRange.max = 21;
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
					if (!preservePreviousResults) {
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
					if (!preservePreviousResults && data.length === 0) {
						var noResults = document.createElement("div");
						noResults.className = "noResults";
						noResults.innerHTML = `
							<div class="iconContainer">
								<i class="gg-bee"></i>
							</div>
							<h2>There's Nothing In Here But Bees!</h2>
							<p>We couldn't find any results.</p>
						`;
						this.element.querySelector(".resultsContainer").appendChild(noResults);
					} else if (preservePreviousResults && data.length === 0) {
						var loadMoreButton = this.element.querySelector(
							".loadMoreButton"
						);
						loadMoreButton.parentElement.removeChild(
							loadMoreButton
						);
					} else {
						if (preservePreviousResults) {
							var loadMoreButton = this.element.querySelector(
								".loadMoreButton"
							);
							loadMoreButton.parentElement.removeChild(
								loadMoreButton
							);
						}

						for (var i = 0; i < data.length; i++) {
							var currentItemData = data[i];
							var item = new Item(currentItemData);
							this.element
								.querySelector(
									".resultsContainer"
								)
								.appendChild(item.element);
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
									this.loadMoreResults();
								}
							);
							this.element
								.querySelector(
									".resultsContainer"
								)
								.appendChild(loadMoreButton);
						}
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
	};
	
	this.loadMoreResults = function () {
		this.searchRange.min += 20;
		this.searchRange.max += 20;
		this.refreshResults(true);
	},

	this.refreshResults();

	//Load available tags
	fetch("/api/tags/")
		.then((request) => request.json())
		.then((data) => {
			var tagFilterOption = {};
			tagFilterOption.id = "tags";
			tagFilterOption.parameterName = "tags[]";
			tagFilterOption.icon = "tag";
			tagFilterOption.label = "Tag";
			tagFilterOption.values = data;
			tagFilterOption.max = data.length;
			this.filters.push(tagFilterOption);
		});
}

function Item(item, options) {
	// For each item property, create a property on the item object
	for (var key in item) {
		this[key] = item[key];
	}

	// Create the element
	this.element = document.createElement("div");
	this.element.className = "itemCard";
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

	var rightSideContainer =
		document.createElement("div");
	rightSideContainer.className = "right";

	var sceneElement = document.createElement("p");
	sceneElement.className = "scene";
	sceneElement.textContent = item.scene;

	var nameElement = document.createElement("h3");
	nameElement.className = "name";
	nameElement.textContent = item.name;

	var infoContainerElement =
		document.createElement("div");
	infoContainerElement.className = "infoContainer";

	var parkElement = document.createElement("p");
	parkElement.className = "park";
	parkElement.textContent = item.park;
	infoContainerElement.appendChild(parkElement);

	var typeElement = document.createElement("p");
	typeElement.className = "type";
	typeElement.textContent = item.type;
	infoContainerElement.appendChild(typeElement);

	if (item.author) {
		var authorElement = document.createElement("p");
		authorElement.className = "author";
		authorElement.textContent =
			item.author.replace(
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
		this.element.appendChild(pictureElement);
	} else if (imgElement) {
		this.element.appendChild(imgElement);
	}
	this.element.appendChild(rightSideContainer);
}

var dialog = {
	queue: [],
	isRendering: false,
	addToQueue: async function (type, title, message, options) {
		return new Promise(function (resolve, reject) {
			dialog.queue.push([type, title, message, options, resolve, reject]);

			if (!dialog.isRendering) {
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
							dialog.callbacks.dismiss();
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
			if (options.placeholders) {
				//Create multiple inputs
				for (var i = 0; i < options.placeholders.length; i++) {
					var input = document.createElement("input");
					input.type = "text";
					input.placeholder = options.placeholders[i];
					input.className = "input";
					dialogElement.appendChild(input);
				}
			} else {
				//Create a single input
				var input = document.createElement("input");
				input.type = "text";
				if (options.placeholder) {
					input.placeholder = options.placeholder;
				}
				input.className = "input";
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
						dialog.callbacks.dismiss();
						reject();
					})
				);
			}
		}

		switch (type) {
			case "alert":
				buttonContainer.appendChild(
					dialog.createButton("Done", "primary", function () {
						dialog.callbacks.dismiss();
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
									dialog.callbacks.dismiss();
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
							dialog.callbacks.dismiss();
							var selectedItems = document.querySelectorAll(".dialog .item.selected");
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
						dialog.callbacks.dismiss();
						var inputs = document.querySelectorAll(".dialog .input");
						var values = [];
						for (var i = 0; i < inputs.length; i++) {
							values.push(inputs[i].value);
						}
						resolve({
							type: "input",
							values: values,
						});
					})
				);
				break;
		}

		document.body.insertBefore(dialogElement, document.querySelector(".overlay"));
		requestAnimationFrame(function () {
			document.querySelector(".dialog").classList.remove("hidden");

			var inputs = document.querySelectorAll(".dialog input");
			if (inputs.length > 0) {
				inputs[0].focus();
			} else if (searchBar) {
				searchBar.focus();
			}
		});
	},

	callbacks: {
		dismiss: function () {
			if (dialog.queue.length > 1) {
				document.querySelector(".overlay").classList.add("show");
			} else {
				document.querySelector(".overlay").classList.remove("show");
			}

			var dialogElement = document.querySelector(".dialog");
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
				<i class="gg-${icon}"></i>
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
				var icon = document.createElement("i");
				icon.classList.add("gg-" + items[i].icon);
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