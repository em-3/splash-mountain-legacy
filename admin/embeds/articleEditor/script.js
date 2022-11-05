//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var mode = params.get("mode");
if (mode === "editor") {
	var id = params.get("id");
}

var unsavedChanges = false;

var properties = [];

//Fetch the article details and content
if (mode === "editor" && id) {
	fetch("/api/news/article/" + id)
		.then((response) => response.json())
		.then(showArticleDetails, showErrorScreen);
} else if (mode === "newArticle") {
	showArticleDetails();
} else {
	showErrorScreen();
}

var contentFieldConstructors = {
	paragraph: {
		name: "Paragraph",
		icon: "format-left",
		constructor(content) {
			var element = document.createElement("textarea");
			element.placeholder = "Paragraph";
			if (content) {
				element.value = content;
			}

			var object = {
				type: "paragraph",
				element: element,
				getValue: function () {
					return this.element.value;
				},
			};
			return object;
		},
	},
	header: {
		name: "Header",
		icon: "format-heading",
		constructor(content) {
			var element = document.createElement("input");
			element.type = "text";
			element.classList.add("header");
			element.placeholder = "Header";
			if (content) {
				element.value = content;
			}

			var object = {
				type: "header",
				element: element,
				getValue: function () {
					return this.element.value;
				},
			};
			return object;
		},
	},
	subheader: {
		name: "Subheader",
		icon: "details-less",
		constructor(content) {
			var element = document.createElement("input");
			element.type = "text";
			element.classList.add("subheader");
			element.placeholder = "Subheader";
			if (content) {
				element.value = content;
			}

			var object = {
				type: "subheader",
				element: element,
				getValue: function () {
					return this.element.value;
				},
			};
			return object;
		},
	},
	image: {
		name: "Image",
		icon: "image",
		constructor(content) {
			//If the page is in editor mode, show the image. Otherwise, allow the user to upload an image.
			var element;
			if (mode === "editor") {
				element = document.createElement("img");
				element.src = "/resources/" + content + "/thumbnail.jpg";
			} else {
				element = document.createElement("input");
				element.type = "file";
				element.accept = "image/*";
			}
			
			var object = {
				type: "image",
				element: element,
				getValue: function () {
					if (mode === "editor") {
						return content;
					} else {
						return this.element.files[0];
					}
				}
			};
			return object;
		}
	},
	quote: {
		name: "Quote",
		icon: "quote",
		constructor(content) {
			var container = document.createElement("div");
			container.classList.add("container");
			var quote = document.createElement("textarea");
			quote.classList.add("quote");
			quote.placeholder = "Quote";
			var author = document.createElement("input");
			author.classList.add("author");
			author.placeholder = "Author";
			container.appendChild(quote);
			container.appendChild(author);

			var object = {
				type: "quote",
				element: container,
				quoteElement: quote,
				authorElement: author,
				getValue: function () {
					return {
						quote: this.quoteElement.value,
						author: this.authorElement.value,
					};
				},
			};
			if (content) {
				object.quoteElement.value = content.quote;
				object.authorElement.value = content.author;
			}
			return object;
		}
	},
	divider: {
		name: "Divider",
		icon: "format-separator",
		constructor(content) {
			var container = document.createElement("div");
			var divider = document.createElement("div");
			divider.classList.add("container");
			divider.classList.add("divider");
			container.appendChild(divider);
			var object = {
				type: "divider",
				element: container,
				getValue: function () {
					return null;
				},
			};
			return object;
		}
	}
};

var contentFields = [];

function addContentField(type, content, position) {
	var contentField = type.constructor(content);
	if (typeof position == "number" && position < contentFields.length) {
		contentFields.splice(position, 0, contentField);
	} else {
		contentFields.push(contentField);
	}
	var element = contentField.element;
	(function (contentField) {
		element.addEventListener("contextmenu", function (event) {
			event.preventDefault();
			contextMenu.present({
				x: event.clientX,
				y: event.clientY,
				items: [
					{
						icon: "arrow-up",
						label: "Move up",
						disabled: contentFields.indexOf(contentField) === 0,
						callback: function () {
							var index = contentFields.indexOf(contentField);
							if (index > 0) {
								contentFields.splice(index, 1);
								contentFields.splice(index - 1, 0, contentField);
								element.parentElement.insertBefore(element, element.previousElementSibling);
							}
						}
					},
					{
						icon: "border-top",
						label: "Insert above",
						callback: function () {
							contextMenu.presentFieldTypeSelector(event)
								.then(function (type) {
									var index = contentFields.indexOf(contentField);
									addContentField(type, null, index);
								});
						}
					},
					{
						icon: "border-bottom",
						label: "Insert below",
						callback: function () {
							contextMenu.presentFieldTypeSelector(event)
								.then(function (type) {
									var index = contentFields.indexOf(contentField);
									addContentField(type, null, index + 1);
								});
						}
					},
					{
						icon: "arrow-down",
						label: "Move down",
						disabled: contentFields.indexOf(contentField) === contentFields.length - 1,
						callback: function () {
							var index = contentFields.indexOf(contentField);
							if (index < contentFields.length - 1) {
								contentFields.splice(index, 1);
								contentFields.splice(index + 1, 0, contentField);
								element.parentElement.insertBefore(element, element.nextElementSibling.nextElementSibling);
							}
						}
					},
					{
						icon: "trash",
						label: "Remove",
						type: "destructive",
						callback: function () {
							//Remove the field from the contentfields array and the DOM
							var index = contentFields.indexOf(contentField);
							contentFields.splice(index, 1);
							element.parentElement.removeChild(element);
						}
					},
				]
			});
		});
	})(contentField);
	var fieldsContainer = document.querySelector(".fields")
	if (typeof position == "number" && position < contentFields.length) {
		fieldsContainer.insertBefore(element, fieldsContainer.children[position]);
	} else {
		fieldsContainer.appendChild(element);
	}
}

contextMenu.presentFieldTypeSelector = function (e) {
	return new Promise(function (resolve, reject) {
		var options = {
			x: e.clientX,
			y: e.clientY,
			items: [],
			reject: reject,
		};
		var keys = Object.keys(contentFieldConstructors);
		for (var i = 0; i < keys.length; i++) {
			var type = contentFieldConstructors[keys[i]];
			(function (type) {
				options.items.push({
					label: type.name,
					icon: type.icon,
					callback: function () {
						resolve(type);
					}
				});
			})(type);
			if (i === 0) {
				options.items[i].type = "active";
			}
		}
		contextMenu.present(options);
	});
}

document.querySelector(".addContentField").addEventListener("click", (e) => {
	contextMenu.presentFieldTypeSelector(e)
		.then(function (type) {
			addContentField(type);
		});
});

function showArticleDetails(articleDetails) {
	//Thumbnail
	properties.push({
		name: "Thumbnail",
		propertyName: "thumbnail",
		constructor: function () {
			var input = document.createElement("input");
			input.type = "file";
			input.name = "thumbnail";
			input.id = "thumbnail";
			if (mode === "editor") {
				input.classList.add("hidden");
			}
			return input;
		},
		valueGetter: function () {
			var fileElement = document.querySelector("#thumbnail");
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
						.querySelector(".thumbnail")
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
	//Title
	properties.push({
		name: "Title",
		propertyName: "title",
		constructor: function () {
			var input = document.createElement("input");
			input.name = "title";
			input.id = "title";
			input.placeholder = "Title";
			if (mode === "editor") {
				input.value = articleDetails.title;
			}
			return input;
		},
		valueGetter: function () {
			var value = document.querySelector("#title").value;
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
	//Subtitle
	properties.push({
		name: "Subtitle",
		propertyName: "subtitle",
		constructor: function () {
			var input = document.createElement("input");
			input.name = "subtitle";
			input.id = "subtitle";
			input.placeholder = "Subtitle";
			if (mode === "editor") {
				input.value = articleDetails.subtitle;
			}
			return input;
		},
		valueGetter: function () {
			var value = document.querySelector("#subtitle").value;
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
	//Author
	properties.push({
		name: "Author",
		propertyName: "author",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("selectContainer");

			var select = document.createElement("select");
			select.name = "author";
			select.id = "author";
			var options = [
				"Splash Mountain Legacy Staff",
				"91J",
				"EM_3",
				"MickeyWaffleCo.",
			];
			for (var i = 0; i < options.length; i++) {
				var currentOption = options[i];
				var optionElement = document.createElement("option");
				optionElement.textContent = currentOption;
				optionElement.value = currentOption;
				select.appendChild(optionElement);
			}
			if (mode === "editor") {
				select.value = articleDetails.author;
			} else {
				select.value = "Splash Mountain Legacy Staff";
			}

			var icon = document.createElement("i");
			icon.classList.add("gg-chevron-down");
			
			container.appendChild(select);
			container.appendChild(icon);
			return container;
		},
		valueGetter: function () {
			var value = document.querySelector("#author").value;
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
	//Publication Mode
	properties.push({
		name: "Publication Mode",
		propertyName: "publicationMode",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("selectContainer");

			var select = document.createElement("select");
			select.name = "publicationMode";
			select.id = "publicationMode";

			var options = ["Publish Now", "Publish Later"];
			for (var i = 0; i < options.length; i++) {
				var currentOption = options[i];
				var optionElement = document.createElement("option");
				optionElement.textContent =
					currentOption[0].toUpperCase() + currentOption.slice(1);
				optionElement.value = currentOption;
				select.appendChild(optionElement);
			}

			select.value = "Publish Now";
			select.onchange = function () {
				var newValue = select.value;
				var publicationTimestamp = document.querySelector(
					".publicationTimestamp"
				);

				switch (newValue) {
					case "Publish Now":
						publicationTimestamp.classList.add("hidden");
						break;
					case "Publish Later":
						publicationTimestamp.classList.remove("hidden");
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
			return {
				include: false,
				fail: false,
			};
		},
	});
	//Publication Timestamp
	properties.push({
		name: "Publication Timestamp",
		propertyName: "publication_timestamp",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("publicationTimestamp");
			container.classList.add("hidden");

			var dateLabel = document.createElement("label");
			dateLabel.for = "date";
			dateLabel.textContent = "Date";
			container.appendChild(dateLabel);
			var dateInput = document.createElement("input");
			dateInput.type = "date";
			dateInput.name = "date";
			dateInput.id = "date";
			if (mode === "editor") {
				dateInput.value = new Date(articleDetails.publication_timestamp)
					.toString()
					.substring(0, 10);
			}
			container.appendChild(dateInput);

			var timeLabel = document.createElement("label");
			timeLabel.for = "time";
			timeLabel.textContent = "Time";
			container.appendChild(timeLabel);
			var timeInput = document.createElement("input");
			timeInput.type = "time";
			timeInput.name = "time";
			timeInput.id = "time";
			if (mode === "editor") {
				timeInput.value = new Date(articleDetails.publication_timestamp)
					.toString()
					.substring(11, 16);
			}
			container.appendChild(timeInput);

			return container;
		},
		valueGetter: function () {
			if (document.querySelector("#publicationMode").value === "Later") {
				var date = document.querySelector(".editor #date").value;
				var time = document.querySelector(".editor #time").value;
				if (date && time) {
					return {
						include: true,
						value: Math.floor(
							new Date(date + " " + time).getTime() / 1000
						),
					};
				} else if (date) {
					return {
						include: true,
						value: Math.floor(new Date(date).getTime() / 1000),
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
		},
	});

	//Show the article property fields
	for (var i = 0; i < properties.length; i++) {
		var currentProperty = properties[i];
		var currentPropertyElement = currentProperty.constructor();
		document
			.querySelector(".editor .properties")
			.appendChild(currentProperty.constructor());
	}

	//Article info preview
	if (mode === "editor") {
		var thumbnailElement = document.querySelector(".thumbnail img");
		thumbnailElement.src = "/resources/" + articleDetails.thumbnail + "/thumbnail.jpg";
		thumbnailElement.classList.remove("hidden");

		document.querySelector(".articleID").textContent = id;
		document.querySelector(".articleName").textContent =
			articleDetails.title;

		document
			.querySelector(".actions.existingArticle")
			.classList.remove("hidden");
	} else {
		document.querySelector(".articleInfo").classList.add("hidden");
		document
			.querySelector(".actions.newArticle")
			.classList.remove("hidden");
	}

	//Article content
	if (mode === "editor") {
		var contentFieldsContainer = document.querySelector(
			".articleEditor .content .fields"
		);
		var content = JSON.parse(articleDetails.content);
		for (var i = 0; i < content.length; i++) {
			var currentField = content[i];
			addContentField(contentFieldConstructors[currentField.type], currentField.content);
		}
	}

	document.querySelector(".loadingContainer").classList.add("hidden");
	requestAnimationFrame(function () {
		document.querySelector(".editor").classList.remove("hidden");
	});
}

async function uploadArticle() {
	document.querySelector(".editor").classList.add("hidden");
	document.querySelector(".progressContainer").classList.remove("hidden");

	//Contact bootstrap endpoint to get article ID
	var articleID = null;
	await fetch("/admin/news/bootstrap.php")
		.then((response) => response.json())
		.then((data) => {
			articleID = data.id;
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

	var content = [];
	for (var i = 0; i < contentFields.length; i++) {
		var currentField = contentFields[i];

		//If the item is an image, upload it first.
		if (currentField.type === "image") {
			var image = currentField.getValue();
			//Upload the image file
			var imageID = null;
			var imageFormData = new FormData();
			imageFormData.append("resource", image);
			imageFormData.append("associated_id", articleID);
			await fetch("/admin/resources/upload.php", {
				method: "POST",
				body: imageFormData,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status = "success") {
						imageID = data.id;
					} else {
						reject(data);
					}
				});
			content.push({
				type: "image",
				content: imageID,
			});
		} else {
			content.push({
				type: currentField.type,
				content: currentField.getValue(),
			});
		}
	}
	formData.append("content", JSON.stringify(content));

	formData.append("id", articleID);
	fetch("/admin/news/create.php", {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((result) => {
			if (result.status === "success") {
				document.querySelector(
					".responseContainer .title"
				).textContent = "Done.";
				document.querySelector(
					".responseContainer .subtitle"
				).textContent = "Your article has been uploaded.";
				document.querySelector(
					".responseContainer .message"
				).textContent = "Item ID: " + result.id;
				unsavedChanges = false;
			} else {
				document.querySelector(
					".responseContainer .title"
				).textContent = "Congratulations, you broke something.";
				document.querySelector(
					".responseContainer .subtitle"
				).textContent = "Good going.";
				document.querySelector(
					".responseContainer .message"
				).textContent = result.error;
			}

			document
				.querySelector(".progressContainer")
				.classList.add("hidden");
			document
				.querySelector(".responseContainer")
				.classList.remove("hidden");
		});
}

async function updateArticle() {
	document.querySelector(".editor").classList.add("hidden");
	document.querySelector(".progressContainer").classList.remove("hidden");

	var formData = new FormData();

	formData.append("id", id);

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

	var response = await fetch("/admin/news/modify.php", {
		method: "POST",
		body: formData,
	});
	let result = await response.json();

	if (result.status === "success") {
		document.querySelector(".responseContainer .title").textContent =
			"Done.";
		document.querySelector(".responseContainer .subtitle").textContent =
			"The article has been updated.";
		document.querySelector(".responseContainer .message").textContent =
			"Item ID: " + result.id;
		unsavedChanges = false;
	} else {
		document.querySelector(".responseContainer .title").textContent =
			"Congratulations, you broke something.";
		document.querySelector(".responseContainer .subtitle").textContent =
			"Good going.";
		document.querySelector(".responseContainer .message").textContent =
			result.error;
	}

	document.querySelector(".progressContainer").classList.add("hidden");
	document.querySelector(".responseContainer").classList.remove("hidden");
}

async function deleteArticle() {
	var confirm = await dialog.confirm(
		"Delete Article",
		"Are you sure you want to delete this article? This action cannot be undone.",
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
	if (confirm !== 0) {
		return;
	}

	document.querySelector(".editor").classList.add("hidden");
	document.querySelector(".progressContainer").classList.remove("hidden");

	var formData = new FormData();

	formData.append("id", id);

	var response = await fetch("/admin/news/delete.php", {
		method: "POST",
		body: formData,
	});
	let result = await response.json();

	if (result.status === "success") {
		document.querySelector(".responseContainer .title").textContent =
			"Done.";
		document.querySelector(".responseContainer .subtitle").textContent =
			"The article has been deleted.";
		document.querySelector(".responseContainer .message").textContent = "";
	} else {
		document.querySelector(".responseContainer .title").textContent =
			"Congratulations, you broke something.";
		document.querySelector(".responseContainer .subtitle").textContent =
			"Good going.";
		document.querySelector(".responseContainer .message").textContent =
			result.error;
	}

	document.querySelector(".progressContainer").classList.add("hidden");
	document.querySelector(".responseContainer").classList.remove("hidden");
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
			"Are you sure you want to close the editor? You'll lose any unpublished changes.",
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
		if (confirm !== 0) {
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
