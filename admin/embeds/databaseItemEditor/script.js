//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var mode = params.get("mode");
if (mode === "editor") {
	var id = params.get("id");
}

var unsavedChanges = false;

var itemDetails = undefined;
var properties = [];

//Fetch the item details and content
if (mode === "editor" && id) {
	fetch("/api/item/" + id)
		.then((response) => response.json())
		.then(showItemDetails, showErrorScreen);
} else if (mode === "newItem") {
	showItemDetails();
} else {
	showErrorScreen();
}

function showItemDetails(itemDetails) {
	if (mode === "editor") {
		window.itemDetails = itemDetails;
		var type = itemDetails.type;
		var metadata = JSON.parse(itemDetails.metadata);
	}

	//Type
	if (mode === "newItem") {
		properties.push({
			name: "Type",
			propertyName: "type",
			constructor: function () {
				var container = document.createElement("div");
				container.classList.add("propertyContainer");
				container.classList.add("selectContainer");
				container.classList.add("type");
				
				var select = document.createElement("select");
				select.name = "type";
				select.id = "type";

				var options = ["image", "video", "audio", "text", "date"];
				for (var i = 0; i < options.length; i++) {
					var currentOption = options[i];
					var optionElement = document.createElement("option");
					optionElement.textContent =
						currentOption[0].toUpperCase() + currentOption.slice(1);
					optionElement.value = currentOption;
					select.appendChild(optionElement);
				}

				select.value = "image";
				select.onchange = function () {
					var newType = select.value;

					var image = document.querySelector(".image");
					var videoID = document.querySelector(".videoID");
					var visibleContent = document.querySelector(".visibleContent");
					var cameraInfoContainer = document.querySelector(
						".cameraInfoContainer"
					);
					var samplingRate = document.querySelector(".samplingRate");

					image.classList.add("hidden");
					videoID.classList.add("hidden");
					visibleContent.classList.add("hidden");
					cameraInfoContainer.classList.add("hidden");
					samplingRate.classList.add("hidden");

					switch (newType) {
						case "image":
							image.classList.remove("hidden");
							visibleContent.classList.remove("hidden");
							cameraInfoContainer.classList.remove("hidden");
							break;
						case "video":
							visibleContent.classList.remove("hidden");
							cameraInfoContainer.classList.remove("hidden");
						case "audio":
							videoID.classList.remove("hidden");
							samplingRate.classList.remove("hidden");
							break;
					}
				};

				var icon = document.createElement("i");
				icon.classList.add("gg-chevron-down");

				container.appendChild(select);
				container.appendChild(icon);
				return container;
			},
			valueGetter: function () {
				var value = document.querySelector("#type").value;
				if (value) {
					return {
						include: true,
						value: value,
					};
				} else {
					return {
						include: false,
						fail: true,
					};
				}
			},
		});
	}

	//Image
	properties.push({
		name: "Image",
		propertyName: "image",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("image");
			if (mode === "editor") {
				container.classList.add("hidden");
			}
			var input = document.createElement("input");
			input.type = "file";
			input.name = "image";
			input.id = "image";
			input.onchange = function (e) {
				var file = e.target.files[0];
				if (file && file.name) {
					EXIF.getData(file, function () {
						var timecode = EXIF.getTag(this, "DateTime");
						if (timecode) {
							var dateTimeSplit = timecode.split(/\D/);
							var dateTimeSplit = timecode.split(/\D/);
							var date =
								dateTimeSplit[0] +
								"-" +
								dateTimeSplit[1] +
								"-" +
								dateTimeSplit[2];
							var time =
								dateTimeSplit[3] + ":" + dateTimeSplit[4];
							document.querySelector("#date").value = date;
							document.querySelector("#time").value = time;
						}
						document.querySelector("#make").value =
							EXIF.getTag(this, "Make") || "";
						document.querySelector("#model").value =
							EXIF.getTag(this, "Model") || "";
						document.querySelector("#focalLength").value =
							EXIF.getTag(this, "FocalLength") || "";
						document.querySelector("#softwareVersion").value =
							EXIF.getTag(this, "Software") || "";
						var exposureTime = EXIF.getTag(this, "ExposureTime");
						if (exposureTime) {
							document.querySelector("#exposureTime").value =
								exposureTime.numerator +
								"/" +
								exposureTime.denominator;
						}
						document.querySelector("#fNumber").value =
							EXIF.getTag(this, "FNumber") || "";
						document.querySelector("#flash").value =
							EXIF.getTag(this, "Flash") || "";

						var colorSpace = EXIF.getTag(this, "ColorSpace");
						if (colorSpace) {
							switch (colorSpace) {
								case 1:
									document.querySelector(
										"#colorSpace"
									).value = "sRGB";
									break;
								case 2:
									document.querySelector(
										"#colorSpace"
									).value = "Adobe RGB";
									break;
								case 3:
									document.querySelector(
										"#colorSpace"
									).value = "Wide Gamut RGB";
									break;
								case 4:
									document.querySelector(
										"#colorSpace"
									).value = "ICC Profile";
									break;
								case 65535:
									document.querySelector(
										"#colorSpace"
									).value = "Uncalibrated";
									break;
							}
						}
						document.querySelector("#samplingRate").value =
							EXIF.getTag(this, "SamplingRate") || "";
					});
				}
			};
			container.appendChild(input);
			return container;
		},
		valueGetter: function () {
			var fileElement = document.querySelector("#image");
			if (fileElement.files.length > 0) {
				var file = fileElement.files[0];
			}
			if (mode === "editor") {
				return {
					include: false,
					fail: false,
				};
			} else {
				if (
					!document
						.querySelector(".image")
						.classList.contains("hidden")
				) {
					if (file) {
						return {
							include: true,
							value: file,
						};
					} else {
						return {
							include: false,
							fail: true,
						};
					}
				} else {
					return {
						include: false,
						fail: false,
					};
				}
			}
		},
	});
	//Video ID
	properties.push({
		name: "YouTube Video ID",
		propertyName: "video_id",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("videoID");
			var input = document.createElement("input");
			input.name = "videoID";
			input.id = "videoID";
			input.placeholder = "YouTube Video ID";
			if (mode === "editor" && (type === "video" || type === "audio")) {
				input.value = itemDetails.video_id;
			} else {
				container.classList.add("hidden");
			}
			container.appendChild(input);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#videoID").value;
			if (mode === "editor") {
				if (type === "video" || type === "audio") {
					if (value) {
						return {
							include: true,
							value: value,
						};
					} else {
						return {
							include: false,
							fail: true,
						};
					}
				} else {
					return {
						include: false,
						fail: false,
					};
				}
			} else {
				if (
					!document
						.querySelector(".videoID")
						.classList.contains("hidden")
				) {
					if (value) {
						return {
							include: true,
							value: value,
						};
					} else {
						return {
							include: false,
							fail: true,
						};
					}
				} else {
					return {
						include: false,
						fail: false,
					};
				}
			}
		},
	});

	//Park
	properties.push({
		name: "Park",
		propertyName: "park",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("selectContainer");
			container.classList.add("park");
			
			var select = document.createElement("select");
			select.name = "park";
			select.id = "park";

			var wdw = document.createElement("option");
			wdw.textContent = "WDW";
			wdw.value = "wdw";
			select.appendChild(wdw);
			var dl = document.createElement("option");
			dl.textContent = "DL";
			dl.value = "dl";
			select.appendChild(dl);
			var tdl = document.createElement("option");
			tdl.textContent = "TDL";
			tdl.value = "tdl";
			select.appendChild(tdl);

			if (mode === "editor") {
				select.value = itemDetails.park.toLowerCase();
			}

			var icon = document.createElement("i");
			icon.classList.add("gg-chevron-down");

			container.appendChild(select);
			container.appendChild(icon);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#park").value.toUpperCase();
			if (value) {
				return {
					include: true,
					value: value,
				};
			} else {
				return {
					include: false,
					fail: true,
				};
			}
		},
	});
	//Scene
	properties.push({
		name: "Scene",
		propertyName: "scene",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("selectContainer");
			container.classList.add("scene");
			
			var select = document.createElement("select");
			select.name = "scene";
			select.id = "scene";

			var values = [
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
			];
			for (var i = 0; i < values.length; i++) {
				var option = document.createElement("option");
				option.textContent = values[i];
				option.value = values[i];
				select.appendChild(option);
			}

			if (mode === "editor") {
				select.value = itemDetails.scene;
			}

			var icon = document.createElement("i");
			icon.classList.add("gg-chevron-down");

			container.appendChild(select);
			container.appendChild(icon);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#scene").value;
			if (value) {
				return {
					include: true,
					value: value,
				};
			} else {
				return {
					include: false,
					fail: true,
				};
			}
		},
	});
	//Name
	properties.push({
		name: "Name",
		propertyName: "name",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("name");
			var input = document.createElement("input");
			input.name = "name";
			input.id = "name";
			input.placeholder = "Name";
			if (mode === "editor") {
				input.value = itemDetails.name;
			}
			container.appendChild(input);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#name").value;
			if (value) {
				return {
					include: true,
					value: value,
				};
			} else {
				return {
					include: false,
					fail: true,
				};
			}
		},
	});
	//Description
	properties.push({
		name: "Description",
		propertyName: "description",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("description");

			var input = document.createElement("textarea");
			input.name = "description";
			input.id = "description";
			input.placeholder = "Description";
			if (mode === "editor") {
				input.value = itemDetails.description;
			}

			container.appendChild(input);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#description").value;
			if (value) {
				return {
					include: true,
					value: value,
				};
			} else {
				return {
					include: false,
					fail: true,
				};
			}
		},
	});
	//Visible Content
	properties.push({
		name: "Visible Content",
		propertyName: "visible_content",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("visibleContent");
			if (mode === "editor" && itemDetails.type !== "image" && itemDetails.type !== "video") {
				container.classList.add("hidden");
			}

			var input = document.createElement("textarea");
			input.name = "visibleContent";
			input.id = "visibleContent";
			input.placeholder = "Text Visible in Media";
			if (mode === "editor") {
				input.value = itemDetails.visible_content;
			}

			container.appendChild(input);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#visibleContent").value;
			if (value) {
				return {
					include: true,
					value: value,
				};
			} else {
				return {
					include: false,
					fail: false,
				};
			}
		},
	});
	//Visibility
	properties.push({
		name: "Visibility",
		propertyName: "hidden",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("selectContainer");
			container.classList.add("visibility");
			
			var select = document.createElement("select");
			select.name = "visibility";
			select.id = "visibility";

			var public = document.createElement("option");
			public.textContent = "Public";
			public.value = "public";
			select.appendChild(public);

			var unlisted = document.createElement("option");
			unlisted.textContent = "Unlisted";
			unlisted.value = "unlisted";
			select.appendChild(unlisted);


			if (mode === "editor") {
				switch (itemDetails.hidden) {
					case 0:
						select.value = "public";
						break;
					case 1:
						select.value = "unlisted";
						break;
				}
			}

			var icon = document.createElement("i");
			icon.classList.add("gg-chevron-down");

			container.appendChild(select);
			container.appendChild(icon);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#visibility").value;
			if (value) {
				switch (value) {
					case "public":
						return {
							include: false,
							fail: false,
						};
						break;
					case "unlisted":
						return {
							include: true,
							value: 1,
						};
						break;
				}
			} else {
				return {
					include: false,
					fail: true,
				};
			}
		},
	});
	//Tags
	properties.push({
		name: "Tags",
		propertyName: "tags",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("row");

			var textContainer = document.createElement("div");
			textContainer.classList.add("textContainer");

			var tagLabel = document.createElement("p");
			tagLabel.textContent = "Tags";
			textContainer.appendChild(tagLabel);

			var tagList = document.createElement("p");
			tagList.classList.add("tagList");
			tagList.id = "tagList";
			if (
				mode === "editor" &&
				itemDetails.tags &&
				itemDetails.tags.length > 0
			) {
				// Replace commas with a comma and a space in itemDetails.tags
				tagList.textContent = itemDetails.tags.replaceAll(",", ", ");
			} else {
				tagList.textContent = "No Tags";
			}
			textContainer.appendChild(tagList);

			container.appendChild(textContainer);

			var selectTagsButton = document.createElement("button");
			selectTagsButton.classList.add("selectButton");
			selectTagsButton.textContent = "Select Tags";
			selectTagsButton.onclick = function () {
				fetch("/api/tags")
					.then(response => response.json())
					.then(tags => {
						// Merge tags from the tagList and the tags from the server
						var tagList = document.querySelector("#tagList");
						var tagListTags = tagList.textContent.split(", ");
						if (tagListTags.length === 1 && tagListTags[0] === "No Tags") {
							tagListTags = [];
						} else {
							tagListTags = tagListTags.filter(tag => {
								return tag !== "";
							});
						}
						tags = tags.concat(tagListTags);

						// Remove duplicates
						tags = tags.filter((tag, index) => {
							return tags.indexOf(tag) === index;
						});

						// Sort tags alphabetically
						tags.sort((a, b) => {
							if (a.toLowerCase() < b.toLowerCase()) {
								return -1;
							} else if (a.toLowerCase() > b.toLowerCase()) {
								return 1;
							} else {
								return 0;
							}
						});

						dialog.list(
							"Choose Tags",
							"Select from preexisting tags or add a new one",
							tags.map(tag => {
								return {label: tag};
							}),
							{
								buttons: [
									{
										text: "Add New",
										type: "active"
									}
								],
								cancellable: true,
								allowMultiple: true,
								preselectedIndexes: tags.map(tag => {
									if (tagListTags.indexOf(tag) !== -1) {
										return tags.indexOf(tag);
									} else {
										return -1;
									}
								})
							}
						).then(response => {
							if (!response) {
								return;
							}
							switch (response.type) {
								case "listSelection":
									//User selected tags
									var selectedTags = response.indexes.map(index => {
										return tags[index];
									});
									tagList.textContent = selectedTags.join(", ");
									if (tagList.textContent === "") {
										tagList.textContent = "No Tags";
									}
									break;
								case "buttonSelection":
									//User clicked the "Add New" button
									dialog.prompt("Add New Tag", "Enter a name for the tag.", {
										placeholder: "Tag Name",
										cancellable: true
									}).then(response => {
										if (!response) {
											return;
										}
										switch (response.type) {
											case "input":
												//User entered a name
												var tag = response.values[0];
												if (tag.length > 0) {
													//Add the tag to the list
													if (tagList.textContent.indexOf(tag) === -1) {
														if (tagList.textContent === "No Tags") {
															tagList.textContent = tag;
														} else {
															tagList.textContent += ", " + tag;
														}
													}
												}
												break;
										}
									});
									break;
							}
						});
					});
			};
			container.appendChild(selectTagsButton);

			return container;
		},
		valueGetter: function () {
			var tags = document.querySelector("#tagList");
			if (tags && tags.textContent !== "No Tags") {
				return {
					include: true,
					value: tags.textContent.replaceAll(", ", ","),
				};
			} else {
				return {
					include: false,
					fail: false,
				};
			}
		},
	});
	//Linked Items
	properties.push({
		name: "Linked Items",
		propertyName: "linked_items",
		constructor: function () {
			var wrapper = document.createElement("div");

			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("row");
			container.classList.add("linkedItems");

			var textContainer = document.createElement("div");
			textContainer.classList.add("textContainer");

			var label = document.createElement("p");
			label.textContent = "Linked Items";
			textContainer.appendChild(label);

			var linkedItemCount = document.createElement("p");
			linkedItemCount.classList.add("linkedItemCount");
			linkedItemCount.id = "linkedItemCount";
			linkedItemCount.textContent = "No Linked Items";
			textContainer.appendChild(linkedItemCount);

			container.appendChild(textContainer);

			var linkedItemsButton = document.createElement("button");
			linkedItemsButton.classList.add("linkedItemsButton");
			linkedItemsButton.textContent = "Select Linked Items";
			linkedItemsButton.onclick = function () {
				dialog.prompt(
					"Linked Items",
					"Select the items you want to link to this item.",
					{
						fields: [{
							type: "item",
							preselectedItems: window.linkedItems.items.map(item => item.id),
						}],
					}
				).then(function (result) {
					if (result && result.type == "input") {
						var linkedItems = result.values[0];
						window.linkedItems.items = [];
						linkedItems.forEach(linkedItem => {
							// If in editor mode, don't allow the item to be linked to itself
							if (mode === "editor" && linkedItem === itemDetails.id) {
								window.linkedItems.rebuildList();
								notification.addToQueue("passive", "danger", "1 Linked Item Removed", "You cannot link an item to itself.");
								return;
							}
							window.linkedItems.add(linkedItem);
						});
					}
				});
			};
			container.appendChild(linkedItemsButton);

			wrapper.appendChild(container);

			var list = document.createElement("div");
			list.classList.add("list");
			list.id = "linkedItemsList";

			window.linkedItems = {
				items: [],
				list: list,
				add: function(itemDetails) {
					var item = new Item(itemDetails, {static: true});
					this.items.push(item);
					// Make item.element draggable and reorderable in list
					item.element.draggable = true;
					item.element.addEventListener("dragstart", function(event) {
						event.dataTransfer.setData("text/plain", item.id);
					});
					item.element.addEventListener("dragover", function(event) {
						event.preventDefault();
					});
					item.element.addEventListener("drop", function(event) {
						event.preventDefault();
						var id = event.dataTransfer.getData("text/plain");
						var draggedItem = window.linkedItems.items.find(item => item.id === id);
						if (draggedItem) {
							var draggedItemIndex = window.linkedItems.items.indexOf(draggedItem);
							var thisItemIndex = window.linkedItems.items.indexOf(item);
							if (draggedItemIndex > -1) {
								window.linkedItems.items.splice(draggedItemIndex, 1);
								window.linkedItems.items.splice(thisItemIndex, 0, draggedItem);
							}
							window.linkedItems.rebuildList();
						}
					});
					window.linkedItems.rebuildList();
				},
				rebuildList: function() {
					while (this.list.firstChild) {
						this.list.removeChild(this.list.firstChild);
					}
					this.items.forEach(item => {
						this.list.appendChild(item.element);
					});
					if (this.items.length === 0) {
						linkedItemCount.textContent = "No Linked Items";
					} else if (this.items.length === 1) {
						linkedItemCount.textContent = "1 Linked Item";
					} else {
						linkedItemCount.textContent = this.items.length + " Linked Items";
					}
				},
				getValue: function () {
					var value = [];
					this.items.forEach(item => {
						value.push(item.id);
					});
					return value;
				},
			}
			if (mode === "editor" && itemDetails.linked_items) {
				itemDetails.linked_items.split(",").forEach((linkedItem) => {
					window.linkedItems.add(linkedItem);
				});
			}

			wrapper.appendChild(list);
			return wrapper;
		},
		valueGetter: function () {
			var value = linkedItems.getValue();
			if (value && value.length > 0) {
				return {
					include: true,
					value: value,
				};
			} else {
				return {
					include: false,
					fail: false,
				};
			}
		},
	});
	//Author
	properties.push({
		name: "Author",
		propertyName: "author",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("row");

			var textContainer = document.createElement("div");
			textContainer.classList.add("textContainer");

			var label = document.createElement("p");
			label.textContent = "Author";
			textContainer.appendChild(label);

			var authorValue = document.createElement("p");
			authorValue.classList.add("authorValue");
			authorValue.id = "authorValue";
			if (
				mode === "editor" &&
				itemDetails.author &&
			itemDetails.author.indexOf("[") !== -1
			) {
				authorValue.textContent = itemDetails.author.substring(
					0,
					itemDetails.author.indexOf("[")
				) + " (" + itemDetails.author.substring(itemDetails.author.indexOf("[") + 1, itemDetails.author.indexOf("]")) + ")";
			} else if (mode === "editor" && itemDetails.author) {
				authorValue.textContent = itemDetails.author;
			} else {
				authorValue.textContent = "None";
			}
			textContainer.appendChild(authorValue);

			container.appendChild(textContainer);

			var selectAuthorButton = document.createElement("button");
			selectAuthorButton.classList.add("selectButton");
			selectAuthorButton.textContent = "Select Author";
			selectAuthorButton.onclick = function () {
				fetch("/api/authors")
					.then(response => response.json())
					.then(authors => {
						dialog.list(
							"Choose an Author",
							"Select a preexisting author or add a new one.",
							authors.map(author => {
								if (author.indexOf("[") !== -1) {
									return {
										label: author.substring(0, author.indexOf("[")),
										sublabel: author.substring(author.indexOf("[") + 1, author.indexOf("]"))
									}
								} else {
									return {
										label: author
									}
								}
							}),
							{
								buttons: [
									{
										text: "Add New",
										type: "active"
									}
								],
								cancellable: true
							}
						).then(response => {
							if (!response) {
								return;
							}
							switch (response.type) {
								case "listSelection":
									//User selected an author
									if (authors[response.index].indexOf("[") !== -1) {
										authorValue.textContent = authors[response.index].substring(0, authors[response.index].indexOf("[")) + " (" + authors[response.index].substring(authors[response.index].indexOf("[") + 1, authors[response.index].indexOf("]")) + ")";
									} else {
										authorValue.textContent = authors[response.index];
									}
									break;
								case "buttonSelection":
									//User clicked the "Add New" button
									dialog.prompt("Add New Author", "Enter the author's name and a link if provided.", {
										placeholders: ["Author Name", "Author Link"],
										cancellable: true
									}).then(response => {
										if (!response) {
											return;
										}
										switch (response.type) {
											case "input":
												//User entered a name
												if (response.values[1]) {
													authorValue.textContent = response.values[0] + " (" + response.values[1] + ")";
												} else {
													authorValue.textContent = response.values[0];
												}
												break;
										}
									});
									break;
							}
						});
					});
			};
			container.appendChild(selectAuthorButton);

			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#authorValue").textContent;
			if (value !== "None") {
				return {
					include: true,
					value: value.replaceAll(" (", "[").replaceAll(")", "]")
				};
			} else {
				return {
					include: false,
					fail: false
				};
			}
		},
	});
	//Metadata
	properties.push({
		name: "Metadata",
		propertyName: "metadata",
		constructor: function () {
			var container = document.createElement("div");

			//Timestamp
			var timestampContainer = document.createElement("div");
			timestampContainer.classList.add("propertyContainer");
			timestampContainer.classList.add("timestamp");

			var dateLabel = document.createElement("label");
			dateLabel.for = "date";
			dateLabel.textContent = "Date";
			timestampContainer.appendChild(dateLabel);
			var dateInput = document.createElement("input");
			dateInput.type = "date";
			dateInput.name = "date";
			dateInput.id = "date";
			if (mode === "editor" && itemDetails.timestamp) {
				dateInput.value = itemDetails.timestamp.split(" ")[0];
			}
			timestampContainer.appendChild(dateInput);

			var timeLabel = document.createElement("label");
			timeLabel.for = "time";
			timeLabel.textContent = "Time";
			timestampContainer.appendChild(timeLabel);
			var timeInput = document.createElement("input");
			timeInput.type = "time";
			timeInput.name = "time";
			timeInput.id = "time";
			if (
				mode === "editor" &&
				itemDetails.timestamp &&
				itemDetails.timestamp.indexOf(" ") !== -1
			) {
				timeInput.value = itemDetails.timestamp.split(" ")[1];
			}
			timestampContainer.appendChild(timeInput);

			var precisionLabel = document.createElement("label");
			precisionLabel.for = "timestampPrecision";
			precisionLabel.textContent = "Timestamp Precision";
			timestampContainer.appendChild(precisionLabel);
			var precisionSelect = document.createElement("select");
			precisionSelect.name = "timestampPrecision";
			precisionSelect.id = "timestampPrecision";
			var precisionOptions = ["year", "month", "day", "hour", "minute"];
			for (var i = 0; i < precisionOptions.length; i++) {
				var option = document.createElement("option");
				option.value = precisionOptions[i];
				option.textContent =
					precisionOptions[i][0].toUpperCase() +
					precisionOptions[i].slice(1);
				precisionSelect.appendChild(option);
			}
			if (mode === "editor" && metadata.precision) {
				precisionSelect.value = metadata.precision;
			}
			var icon = document.createElement("i");
			icon.classList.add("gg-chevron-down");
			timestampContainer.appendChild(precisionSelect);
			timestampContainer.appendChild(icon);

			container.appendChild(timestampContainer);

			//Hardware Info
			var hardwareInfoContainer = document.createElement("div");
			hardwareInfoContainer.classList.add("propertyContainer");

			//Make
			var makeInput = document.createElement("input");
			makeInput.name = "make";
			makeInput.id = "make";
			makeInput.placeholder = "Recording Device Make";
			if (mode === "editor" && metadata.make) {
				makeInput.value = metadata.make;
			}
			hardwareInfoContainer.appendChild(makeInput);

			//Model
			var modelInput = document.createElement("input");
			modelInput.name = "model";
			modelInput.id = "model";
			modelInput.placeholder = "Recording Device Model";
			if (mode === "editor" && metadata.model) {
				modelInput.value = metadata.model;
			}
			hardwareInfoContainer.appendChild(modelInput);

			container.appendChild(hardwareInfoContainer);

			//CAMERA
			var cameraInfoContainer = document.createElement("div");
			cameraInfoContainer.classList.add("propertyContainer");
			cameraInfoContainer.classList.add("cameraInfoContainer");

			//Focal Length
			var focalLengthInput = document.createElement("input");
			focalLengthInput.name = "focalLength";
			focalLengthInput.id = "focalLength";
			focalLengthInput.placeholder = "Focal Length (20.1)";
			if (mode === "editor" && metadata.focalLength) {
				focalLengthInput.value = metadata.focalLength;
			}
			cameraInfoContainer.appendChild(focalLengthInput);

			//Software Version
			var softwareVersionInput = document.createElement("input");
			softwareVersionInput.name = "softwareVersion";
			softwareVersionInput.id = "softwareVersion";
			softwareVersionInput.placeholder = "Software Version (15.0)";
			if (mode === "editor" && metadata.software) {
				softwareVersionInput.value = metadata.software;
			}
			cameraInfoContainer.appendChild(softwareVersionInput);

			//Exposure Time
			var exposureTimeInput = document.createElement("input");
			exposureTimeInput.name = "exposureTime";
			exposureTimeInput.id = "exposureTime";
			exposureTimeInput.placeholder = "Exposure Time (1/50)";
			if (mode === "editor" && metadata.exposureTime) {
				exposureTimeInput.value = metadata.exposureTime;
			}
			cameraInfoContainer.appendChild(exposureTimeInput);

			//F-number
			var fNumberInput = document.createElement("input");
			fNumberInput.name = "fNumber";
			fNumberInput.id = "fNumber";
			fNumberInput.placeholder = "F-number (4.0)";
			if (mode === "editor" && metadata.fNumber) {
				fNumberInput.value = metadata.fNumber;
			}
			cameraInfoContainer.appendChild(fNumberInput);

			//Flash
			var flashInput = document.createElement("input");
			flashInput.name = "flash";
			flashInput.id = "flash";
			flashInput.placeholder =
				"Flash (Flash did not fire, compulsory flash mode)";
			if (mode === "editor" && metadata.flash) {
				flashInput.value = metadata.flash;
			}
			cameraInfoContainer.appendChild(flashInput);

			//Color Space
			var colorSpaceInput = document.createElement("input");
			colorSpaceInput.name = "colorSpace";
			colorSpaceInput.id = "colorSpace";
			colorSpaceInput.placeholder = "Color Space (sRGB)";
			if (mode === "editor" && metadata.colorSpace) {
				colorSpaceInput.value = metadata.colorSpace;
			}
			cameraInfoContainer.appendChild(colorSpaceInput);

			if (mode === "editor" && !(type === "image" || type === "video")) {
				cameraInfoContainer.classList.add("hidden");
			}
			container.appendChild(cameraInfoContainer);

			//MICROPHONE
			//Sampling Rate
			var samplingRateContainer = document.createElement("div");
			samplingRateContainer.classList.add("propertyContainer");
			samplingRateContainer.classList.add("samplingRate");

			var samplingRateInput = document.createElement("input");
			samplingRateInput.name = "samplingRate";
			samplingRateInput.id = "samplingRate";
			samplingRateInput.placeholder = "Sampling Rate (196.33 kbit/s)";
			if (mode === "editor" && metadata.samplingRate) {
				samplingRateInput.value = metadata.samplingRate;
			}
			samplingRateContainer.appendChild(samplingRateInput);

			if (
				!(mode === "editor" && (type === "video" || type === "audio"))
			) {
				samplingRateContainer.classList.add("hidden");
			}
			container.appendChild(samplingRateContainer);

			return container;
		},
		valueGetter: function () {
			var updatedMetadata = {};
			var elements = {};
			elements.timestampPrecision =
				document.getElementById("timestampPrecision");
			elements.make = document.getElementById("make");
			elements.model = document.getElementById("model");
			elements.focalLength = document.getElementById("focalLength");
			elements.softwareVersion =
				document.getElementById("softwareVersion");
			elements.exposureTime = document.getElementById("exposureTime");
			elements.fNumber = document.getElementById("fNumber");
			elements.flash = document.getElementById("flash");
			elements.colorSpace = document.getElementById("colorSpace");
			elements.samplingRate = document.getElementById("samplingRate");

			if (elements.timestampPrecision.value) {
				updatedMetadata.precision = elements.timestampPrecision.value;
			}
			if (elements.make.value) {
				updatedMetadata.make = elements.make.value;
			}
			if (elements.model.value) {
				updatedMetadata.model = elements.model.value;
			}

			if (
				!document
					.querySelector(".cameraInfoContainer")
					.classList.contains("hidden")
			) {
				if (elements.focalLength.value) {
					updatedMetadata.focalLength = elements.focalLength.value;
				}
				if (elements.softwareVersion.value) {
					updatedMetadata.software = elements.softwareVersion.value;
				}
				if (elements.exposureTime.value) {
					updatedMetadata.exposureTime = elements.exposureTime.value;
				}
				if (elements.fNumber.value) {
					updatedMetadata.fNumber = elements.fNumber.value;
				}
				if (elements.flash.value) {
					updatedMetadata.flash = elements.flash.value;
				}
				if (elements.colorSpace.value) {
					updatedMetadata.colorSpace = elements.colorSpace.value;
				}
			}

			if (
				!elements.samplingRate.classList.contains("hidden") &&
				elements.samplingRate.value
			) {
				updatedMetadata.samplingRate = elements.samplingRate.value;
			}

			return {
				include: true,
				value: JSON.stringify(updatedMetadata),
			};
		},
	});

	//Show the item property fields
	for (var i = 0; i < properties.length; i++) {
		var currentProperty = properties[i];
		var currentPropertyElement = currentProperty.constructor();
		document
			.querySelector(".editor .properties")
			.appendChild(currentPropertyElement);
	}

	if (mode === "editor") {
		var itemIDElement = document.querySelector(".itemID");
		document.querySelector(".itemID span").textContent = id;
		itemIDElement.onclick = function(e) {
			contextMenu.present({
				x: e.clientX,
				y: e.clientY,
				items: [
					{
						label: "Copy ID",
						icon: "copy",
						callback: function() {
							navigator.clipboard.writeText(id);
							notification.addToQueue(
								"progress",
								"copy",
								"Copied",
								"Item ID copied to clipboard"
							)
						}
					},
					{
						label: "Open Item",
						icon: "external",
						callback: function() {
							window.open("/item/" + id);
						}
					}
				]
			})
		}
		itemIDElement.classList.remove("hidden");
		document
			.querySelector(".actions.existingItem")
			.classList.remove("hidden");
	} else {
		document.querySelector(".actions.newItem").classList.remove("hidden");
	}

	document.querySelector(".loadingContainer").classList.add("hidden");
	requestAnimationFrame(function () {
		document.querySelector(".editor").classList.remove("hidden");
	});
}

function updateProgressStatus(title, subtitle, message, actions) {
	if (typeof title === "string") { document.querySelector(".statusContainer .title").textContent = title; }
	if (typeof subtitle === "string") { document.querySelector(".statusContainer .subtitle").textContent = subtitle; }
	if (typeof message === "string") { document.querySelector(".statusContainer .message").textContent = message; }
	if (typeof actions === "string") { document.querySelector(".statusContainer .actions." + actions).classList.remove("hidden"); }
}

async function uploadItem() {
	document.querySelector(".editor").classList.add("hidden");
	updateProgressStatus(
		"Uploading",
		"We're uploading your item.",
		"Compiling item properties..."
	)
	document.querySelector(".progressContainer").classList.remove("hidden");
	requestAnimationFrame(() => {
		document.querySelector("#package").checked = true;
	});

	var formData = new FormData();

	for (var i = 0; i < properties.length; i++) {
		var currentProperty = properties[i];
		var currentPropertyValue = currentProperty.valueGetter();
		if (currentPropertyValue.include) {
			formData.append(
				currentProperty.propertyName,
				currentPropertyValue.value
			);
		} else if (currentPropertyValue.fail) {
			document
				.querySelector(".editor .errorMessage")
				.classList.remove("hidden");
			document.querySelector(".editor .errorMessage").textContent =
				"Please fill out all required fields.";
			document
				.querySelector(".progressContainer")
				.classList.add("hidden");
			document.querySelector(".editor").classList.remove("hidden");
			return;
		}
	}

	var date = document.querySelector(".editor #date").value;
	var time = document.querySelector(".editor #time").value;
	if (date && time) {
		formData.append("timestamp", date + " " + time);
	} else if (date) {
		formData.append("timestamp", date);
	}

	updateProgressStatus(
		undefined,
		undefined,
		"Generating item ID..."
	)

	var itemID;
	fetch("/admin/item/bootstrap.php")
		.then((response) => response.json())
		.then((data) => {
			if (data.status === "success") {
				itemID = data.id;
			}
		})
		.then(() => {
			formData.append("id", itemID);

			updateProgressStatus(
				undefined,
				undefined,
				"Uploading item..."
			)

			fetch("/admin/item/create.php", {
				method: "POST",
				body: formData,
			})
				.then((response) => response.json())
				.then((result) => {
					if (result.status === "success") {
						updateProgressStatus(
							"Uploaded",
							"The item has been uploaded successfully.",
							"Item ID: " + result.id,
							"success"
						)
						unsavedChanges = false;
					} else {
						updateProgressStatus(
							"Upload Failed",
							"Something went wrong while uploading your item.",
							result.error,
							"uploadFailure"
						)
					}
				});
		});
}

async function updateItem() {
	document.querySelector(".editor").classList.add("hidden");
	updateProgressStatus(
		"Updating",
		"We're uploading your changes.",
		"Compiling item properties..."
	)
	document.querySelector(".progressContainer").classList.remove("hidden");

	var formData = new FormData();

	formData.append("id", id);

	for (var i = 0; i < properties.length; i++) {
		var currentProperty = properties[i];
		var currentPropertyValue = currentProperty.valueGetter();
		if (currentPropertyValue.include && (currentPropertyValue.value !== itemDetails[currentProperty.propertyName])) {
			formData.append(
				currentProperty.propertyName,
				currentPropertyValue.value
			);
		} else if (currentPropertyValue.fail) {
			document
				.querySelector(".editor .errorMessage")
				.classList.remove("hidden");
			document.querySelector(".editor .errorMessage").textContent =
				"Please fill out all required fields.";
			document
				.querySelector(".progressContainer")
				.classList.add("hidden");
			document.querySelector(".editor").classList.remove("hidden");
			return;
		}
	}

	var date = document.querySelector(".editor #date").value;
	var time = document.querySelector(".editor #time").value;
	var timestamp = undefined;
	if (date && time) {
		timestamp = date + " " + time;
	} else if (date) {
		timestamp = date;
	}
	if (timestamp && (timestamp !== itemDetails.timestamp)) {
		formData.append("timestamp", timestamp);
	}

	updateProgressStatus(
		undefined,
		undefined,
		"Uploading item changes..."
	)

	var response = await fetch("/admin/item/modify.php", {
		method: "POST",
		body: formData,
	});
	let result = await response.json();

	if (result.status === "success") {
		updateProgressStatus(
			"Updated",
			"The item has been updated successfully.",
			"Item ID: " + result.id,
			"success"
		)
		unsavedChanges = false;
	} else {
		updateProgressStatus(
			"Update Failed",
			"Something went wrong while uploading your changes.",
			result.error,
			"updateFailure"
		)
	}
}

async function deleteItem() {
	var confirm = await dialog.confirm(
		"Delete Item",
		"Are you sure you want to delete this item? This action cannot be undone.",
		{
			cancellable: true,
			buttons: [
				{
					text: "Delete",
					type: "destructive",
				},
			],
		}
	);
	if (confirm.index !== 0) {
		return;
	}

	document.querySelector(".editor").classList.add("hidden");
	updateProgressStatus(
		"Deleting",
		"We're deleting your item.",
		"Requesting item deletion..."
	)
	document.querySelector(".progressContainer").classList.remove("hidden");
	requestAnimationFrame(() => {
		var packageContainer = document.querySelector(".package_animation");
		var checkbox = document.querySelector("#package");

		packageContainer.classList.add("noTransition");
		requestAnimationFrame(() => {
			checkbox.checked = true;
			requestAnimationFrame(() => {
				packageContainer.classList.remove("noTransition");
				requestAnimationFrame(() => {
					checkbox.checked = false;
				});
			});
		});
	});

	var formData = new FormData();

	formData.append("id", id);

	var response = await fetch("/admin/item/delete.php", {
		method: "POST",
		body: formData,
	});
	let result = await response.json();

	if (result.status === "success") {
		updateProgressStatus(
			"Deleted",
			"The item has been successfully deleted.",
			"",
			"success"
		)
	} else {
		updateProgressStatus(
			"Deletion Failed",
			"Something went wrong while trying to delete the item.",
			result.error,
			"deleteFailure"
		)
	}
}

function showErrorScreen() {
	//Hide the loading screen and show the error screen
	document.querySelector(".loadingContainer").classList.add("hidden");
	document.querySelector(".errorContainer").classList.remove("hidden");
}

//Listen for any change events
document.addEventListener("change", function (event) {
	unsavedChanges = true;
});

async function closeEditor() {
	if (unsavedChanges) {
		var confirm = await dialog.confirm(
			"Close Editor",
			"Are you sure you want to close the editor? You'll lose any unsaved changes.",
			{
				cancellable: true,
				buttons: [
					{
						text: "Close",
						type: "active",
					},
				],
			}
		);
		if (confirm.index !== 0) {
			return;
		}
	}

	if (params.get("fromViewer") === "true") {
		window.history.back();
		return false;
	} else {
		window.top.postMessage("closeEditor", "*");
	}
}

//Listen for requests from the parent window
window.addEventListener("message", function (e) {
	if (e.data === "close") {
		closeEditor();
	}
});