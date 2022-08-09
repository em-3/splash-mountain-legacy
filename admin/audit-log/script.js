var auditLog = {
	searchRange: {
		min: 1,
		max: 21,
	},
	refreshResults: function (preservePreviousResults) {
		if (!preservePreviousResults) {
			auditLog.searchRange.min = 1;
			auditLog.searchRange.max = 21;
		}

		//Fetch new results
		fetch("/admin/audits/" + "?min=" + auditLog.searchRange.min + "&max=" + auditLog.searchRange.max)
			.then((response) => response.json())
			.then(
				(data) => {
					if (data.status !== "success") {
						return;
					} else {
						data = data.audit_data;
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
							var typeIconElement = document.createElement("i");
							typeIconElement.classList.add("icon");
							if (currentLogData.type === "article") {
								typeIconContainer.title = "Article";
								typeIconElement.classList.add("gg-file-document");
							} else if (currentLogData.type === "item") {
								typeIconContainer.title = "Item";
								typeIconElement.classList.add("gg-file");
							}
							typeIconContainer.appendChild(typeIconElement);
							resultElement.appendChild(typeIconContainer);

							var actionIconContainer = document.createElement("div");
							var actionIconElement = document.createElement("i");
							actionIconElement.classList.add("icon");
							if (currentLogData.action === "create") {
								actionIconContainer.title = "Created";
								actionIconElement.classList.add("gg-add");
							} else if (currentLogData.action === "modify") {
								actionIconContainer.title = "Edited";
								actionIconElement.classList.add("gg-edit-exposure");
							} else if (currentLogData.action === "delete") {
								actionIconContainer.title = "Deleted";
								actionIconElement.classList.add("gg-remove");
							}
							actionIconContainer.appendChild(actionIconElement);
							resultElement.appendChild(actionIconContainer);

							var itemIDElement = document.createElement("p");
							itemIDElement.className = "itemID";
							itemIDElement.textContent = currentLogData.item_id;
							resultElement.appendChild(itemIDElement);

							var userIDElement = document.createElement("p");
							userIDElement.className = "userID";
							userIDElement.textContent = currentLogData.user_id;
							resultElement.appendChild(userIDElement);

							var changesButton = document.createElement("button");
							changesButton.className = "changesButton";
							changesButton.textContent = "View Changes";
							(function (changes) {
								changesButton.addEventListener("click", function () {
									auditLog.showChanges(changes);
								});
							})(JSON.parse(currentLogData.changes));
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
