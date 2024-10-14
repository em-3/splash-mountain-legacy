var userInformation = {};

var auditLog = {
	searchRange: {
		min: 1,
		max: 21,
	},
	data: null,
	filterType: null,
	filterValue: null,
	sortOrder: 'newest_first',
	
	refreshResults: function (preservePreviousResults) {
		if (!preservePreviousResults) {
			auditLog.searchRange.min = 1;
			auditLog.searchRange.max = 21;
		}

		var url = "/admin/audits/?min=" + auditLog.searchRange.min + "&max=" + auditLog.searchRange.max;
		if (auditLog.filterType && auditLog.filterValue) {
			url += "&filter_type=" + auditLog.filterType + "&filter_value=" + auditLog.filterValue;
		}
		if (auditLog.sortOrder) {
			url += "&sort_order=" + auditLog.sortOrder;
		}

		//Fetch new results
		fetch(url)
			.then((response) => response.json())
			.then(
				async (data) => {
					if (data.status !== "success") {
						return;
					} else {
						data = data.audit_data;
						auditLog.data = data;
					}

					if (!preservePreviousResults) {
						//Clear the current results from the container
						while (document.querySelector(".auditLog .resultsContainer").children[1]) {
							document.querySelector(".auditLog .resultsContainer").removeChild(document.querySelector(".auditLog .resultsContainer").children[1]);
						}
					}
					if (!preservePreviousResults && data.length === 0) {
						var noResults = document.createElement("p");
						noResults.className = "noResults";
						noResults.textContent = "No logs found.";
						document.querySelector(".auditLog .resultsContainer").appendChild(noResults);
					} else if (preservePreviousResults && data.length === 0) {
						var loadMoreButton = document.querySelector(".auditLog .loadMoreButton");
						loadMoreButton.parentElement.removeChild(loadMoreButton);
					} else {
						if (preservePreviousResults) {
							var loadMoreButton = document.querySelector(".auditLog .loadMoreButton");
							loadMoreButton.parentElement.removeChild(loadMoreButton);
						}

						for (var i = 0; i < data.length; i++) {
							var currentLogData = data[i];

							var resultElement = document.createElement("div");
							resultElement.className = "logRow";

							var typeIconContainer = document.createElement("div");
							var typeIconElement = document.createElement("iconify-icon");
							typeIconElement.classList.add("icon");
							if (currentLogData.type === "article") {
								typeIconContainer.title = "Article";
								typeIconElement.icon = "mdi:file-document";
								typeIconContainer.onclick = function () {
									auditLog.applyFilter("type", "article");
								};
							} else if (currentLogData.type === "item") {
								typeIconContainer.title = "Item";
								typeIconElement.icon ="mdi:file";
								typeIconContainer.onclick = function () {
									auditLog.applyFilter("type", "item");
								};
							}
							typeIconContainer.appendChild(typeIconElement);
							resultElement.appendChild(typeIconContainer);

							var actionIconContainer = document.createElement("div");
							var actionIconElement = document.createElement("iconify-icon");
							actionIconElement.classList.add("icon");
							if (currentLogData.action === "create") {
								actionIconContainer.title = "Created";
								actionIconElement.icon = "mdi:plus";
								actionIconContainer.onclick = function () {
									auditLog.applyFilter("action", "create");
								}
							} else if (currentLogData.action === "modify") {
								actionIconContainer.title = "Edited";
								actionIconElement.icon = "mdi:edit";
								actionIconContainer.onclick = function () {
									auditLog.applyFilter("action", "modify");
								}
							} else if (currentLogData.action === "delete") {
								actionIconContainer.title = "Deleted";
								actionIconElement.icon = "mdi:minus";
								actionIconContainer.onclick = function () {
									auditLog.applyFilter("action", "delete");
								};
							}
							actionIconContainer.appendChild(actionIconElement);
							resultElement.appendChild(actionIconContainer);

							var itemIDElement = document.createElement("p");
							itemIDElement.className = "itemID";
							itemIDElement.textContent = currentLogData.item_id;
							((itemID) => {
								itemIDElement.addEventListener("click", (e) => {
									contextMenu.present({
										x: e.clientX,
										y: e.clientY,
										items: [
											{
												label: "Filter to Item",
												icon: "mdi:filter",
												type: "active",
												callback: () => {
													auditLog.applyFilter("item_id", itemID);
												}
											},
											{
												label: "Copy Item ID",
												icon: "mdi:asterisk",
												callback: () => {
													navigator.clipboard.writeText(itemID);
													notification.show("passive", "copy", "Copied", "Item ID copied to clipboard.");
												}
											}
										]
									})
								});
							})(currentLogData.item_id);
							resultElement.appendChild(itemIDElement);

							var userInfoContainer = document.createElement("div");
							userInfoContainer.className = "userInfoContainer";
							var profilePicture = document.createElement("img");
							var usernameElement = document.createElement("p");

							userInfoContainer.appendChild(profilePicture);
							userInfoContainer.appendChild(usernameElement);
							resultElement.appendChild(userInfoContainer);

							var currentUserInfo;
							if (userInformation[currentLogData.user_id]) {
								currentUserInfo = userInformation[currentLogData.user_id];
							} else {
								currentUserInfo = await fetch("/api/profile/?id=" + currentLogData.user_id);
								currentUserInfo = await currentUserInfo.json();
								currentUserInfo = currentUserInfo.user_data;
								userInformation[currentLogData.user_id] = currentUserInfo;
							}

							profilePicture.src = "/images/authors/splashmountainlegacystaff.jpg";
							usernameElement.textContent = currentUserInfo.username;
							(function (currentUserInfo) {
								userInfoContainer.onclick = (e) => {
									contextMenu.present({
										x: e.clientX,
										y: e.clientY,
										items: [
											{
												label: "Filter to User",
												icon: "mdi:filter",
												type: "active",
												callback: () => {
													auditLog.applyFilter("user_id", currentUserInfo.id);
												}
											},
											{
												label: "Copy User ID",
												icon: "mdi:asterisk",
												callback: () => {
													navigator.clipboard.writeText(currentUserInfo.id);
													notification.show("passive", "copy", "Copied", "User ID copied to clipboard.");
												}
											},
											{
												label: "Copy Username",
												icon: "mdi:notes",
												callback: () => {
													navigator.clipboard.writeText(currentUserInfo.username);
													notification.show("passive", "copy", "Copied", "Username copied to clipboard.");
												}
											},
										]
									})
								};
							})(currentUserInfo);

							var changesButton = document.createElement("button");
							changesButton.className = "changesButton";
							changesButton.textContent = "View Changes";
							if (currentLogData.action === "delete") {
								changesButton.disabled = true;
							} else {
								(function (changes) {
									changesButton.addEventListener("click", function () {
										auditLog.showChanges(changes);
									});
								})(JSON.parse(currentLogData.changes));
							}
							resultElement.appendChild(changesButton);

							var timestampElement = document.createElement("p");
							timestampElement.className = "timestamp";
							timestampElement.textContent = currentLogData.timestamp;
							resultElement.appendChild(timestampElement);

							document.querySelector(".auditLog .resultsContainer").appendChild(resultElement);
						}

						if (data.length === this.searchRange.max - this.searchRange.min) {
							var loadMoreButton = document.createElement("button");
							loadMoreButton.className = "loadMoreButton";
							loadMoreButton.textContent = "Load More";
							loadMoreButton.addEventListener("click", function () {
								auditLog.loadMoreResults();
							});
							document.querySelector(".auditLog .resultsContainer").appendChild(loadMoreButton);
						}
					}

					//Hide the loading screen and show the results container
					document.querySelector(".auditLog .loadingContainer").classList.add("hidden");
					document.querySelector(".auditLog .resultsContainer").classList.remove("hidden");
					document.querySelector(".auditLog .errorMessageContainer").classList.add("hidden");
				},
				(error) => {
					document.querySelector(".auditLog .errorMessageContainer .title").textContent = "Something Went Wrong";
					document.querySelector(".auditLog .errorMessageContainer .subtitle").textContent = "Failed to load database items.";

					//Hide the loading screen and show the error message container
					document.querySelector(".auditLog .loadingContainer").classList.add("hidden");
					document.querySelector(".auditLog .resultsContainer").classList.add("hidden");
					document.querySelector(".auditLog .errorMessageContainer").classList.remove("hidden");
				}
			);
	},
	loadMoreResults: function () {
		this.searchRange.min += 20;
		this.searchRange.max += 20;
		this.refreshResults(true);
	},
	applyFilter: function (type, value) {auditLog
		if (auditLog.filterType !== null && auditLog.filterValue !== null) {
			document.querySelector(".auditLog .header ." + auditLog.filterType).classList.remove("filtered");
			document.querySelector(".auditLog .header ." + auditLog.filterType).onclick = null;
			document.querySelector(".auditLog .header ." + auditLog.filterType + " .filterValue").textContent = "";
			auditLog.filterType = null;
			auditLog.filterValue = null;
		}
		if (type && value) {
			auditLog.filterType = type;
			auditLog.filterValue = value;
			document.querySelector(".auditLog .header ." + type).classList.add("filtered");
			document.querySelector(".auditLog .header ." + type).onclick = auditLog.applyFilter;
			document.querySelector(".auditLog .header ." + type + " .filterValue").textContent = value;
		}
		auditLog.refreshResults();
	},
	showChanges: function (changes) {
		var changesList = "";
		for (var property in changes) {
			if (changesList.length > 0) {
				changesList += "\r\n";
			}
			changesList += property + ": " + changes[property];
		}
		dialog.alert("Changes", changesList);
	},
};

auditLog.refreshResults();
