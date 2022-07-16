//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var mode = params.get("mode");
if (mode === "editor") {
	var id = params.get("id");
}

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
	text: {
		name: "Text",
		constructor(content) {
			var object = {
				element: document.createElement("textarea"),
				getValue: function () {
					return this.element.value;
				},
			};
			if (content) {
				object.element.value = content;
			}
			return object;
		},
	},
};

var contentFields = [];
var keys = Object.keys(contentFieldConstructors);
for (var i = 0; i < keys.length; i++) {
	var type = contentFieldConstructors[keys[i]];
	var element = document.createElement("div");
	var label = document.createElement("p");
	label.textContent = type.name;
	(function () {
		label.onclick = function () {
			addContentField(type);
		};
	})();
	element.appendChild(label);
	document.querySelector(".addSection").appendChild(element);
}

function addContentField(type, content) {
	contentFields.push(type.constructor(content));
	document.querySelector(".fields").appendChild(contentFields[contentFields.length - 1].element);
}

function showArticleDetails(articleDetails) {
	//Thumbnail
	properties.push({
		name: "Thumbnail",
		propertyName: "thumbnail",
		constructor: function () {
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("thumbnail");
			if (mode === "editor") {
				container.classList.add("hidden");
			}
			var label = document.createElement("label");
			label.for = "thumbnail";
			label.textContent = "Thumbnail Image";
			var input = document.createElement("input");
			input.type = "file";
			input.name = "thumbnail";
			input.id = "thumbnail";

			container.appendChild(label);
			container.appendChild(input);
			return container;
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
				if (!document.querySelector(".thumbnail").classList.contains("hidden")) {
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
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("title");
			var label = document.createElement("label");
			label.for = "title";
			label.textContent = "Title";
			var input = document.createElement("input");
			input.name = "title";
			input.id = "title";
			if (mode === "editor") {
				input.value = articleDetails.title;
			}
			container.appendChild(label);
			container.appendChild(input);
			return container;
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
			var container = document.createElement("div");
			container.classList.add("propertyContainer");
			container.classList.add("subtitle");
			var label = document.createElement("label");
			label.for = "subtitle";
			label.textContent = "Subtitle";
			var input = document.createElement("input");
			input.name = "subtitle";
			input.id = "subtitle";
			if (mode === "editor") {
				input.value = articleDetails.subtitle;
			}
			container.appendChild(label);
			container.appendChild(input);
			return container;
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
			container.classList.add("propertyContainer");
			container.classList.add("author");
			var label = document.createElement("label");
			label.for = "author";
			label.textContent = "Author";
			var select = document.createElement("select");
			select.name = "author";
			select.id = "author";

			var options = ["Splash Mountain Legacy Staff", "91J Loves Disney", "EM_3", "MickeyWaffleCo."];
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

			container.appendChild(label);
			container.appendChild(select);
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
			container.classList.add("propertyContainer");
			container.classList.add("publicationMode");
			var label = document.createElement("label");
			label.for = "publicationMode";
			label.textContent = "Publish";
			var select = document.createElement("select");
			select.name = "publicationMode";
			select.id = "publicationMode";

			var options = ["Now", "Later"];
			for (var i = 0; i < options.length; i++) {
				var currentOption = options[i];
				var optionElement = document.createElement("option");
				optionElement.textContent = currentOption[0].toUpperCase() + currentOption.slice(1);
				optionElement.value = currentOption;
				select.appendChild(optionElement);
			}

			select.value = "Now";
			select.onchange = function () {
				var newValue = select.value;
				var publicationTimestamp = document.querySelector(".publicationTimestamp");

				switch (newValue) {
					case "Now":
						publicationTimestamp.classList.add("hidden");
						break;
					case "Later":
						publicationTimestamp.classList.remove("hidden");
						break;
				}
			};

			container.appendChild(label);
			container.appendChild(select);
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
			container.classList.add("propertyContainer");
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
				dateInput.value = new Date(articleDetails.publication_timestamp).toString().substring(0, 10);
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
				timeInput.value = new Date(articleDetails.publication_timestamp).toString().substring(11, 16);
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
						value: Math.floor(new Date(date + " " + time).getTime() / 1000),
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
					include: true,
					value: Math.floor(new Date().getTime() / 1000),
				};
			}
		},
	});

	//Show the article details
	for (var i = 0; i < properties.length; i++) {
		var currentProperty = properties[i];
		document.querySelector(".editor .properties").appendChild(currentProperty.constructor());
	}

	//Article info preview
	if (mode === "editor") {
		var thumbnailElement = document.querySelector(".thumbnail img");
		thumbnailElement.src = "/resources/" + articleDetails.thumbnail + "/thumbnail";
		thumbnailElement.classList.remove("hidden");

		document.querySelector(".articleID").textContent = id;
		document.querySelector(".articleName").textContent = articleDetails.title;

		document.querySelector(".actions.existingArticle").classList.remove("hidden");
	} else {
		document.querySelector(".articleInfo").classList.add("hidden");
		document.querySelector(".actions.newArticle").classList.remove("hidden");
	}

	//Article content
	if (mode === "editor") {
		var contentFieldsContainer = document.querySelector(".articleEditor .content .fields");
		var content = JSON.parse(articleDetails.content);
		for (var i = 0; i < content.length; i++) {
			var currentField = content[i];
			if (typeof currentField === "string") {
				addContentField(contentFieldConstructors.text, currentField);
			}
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

	var formData = new FormData();

	for (var i = 0; i < properties.length; i++) {
		var currentProperty = properties[i];
		var currentPropertyValue = currentProperty.valueGetter();
		if (currentPropertyValue.include) {
			formData.append(currentProperty.propertyName, currentPropertyValue.value);
		} else if (currentPropertyValue.fail) {
			document.querySelector(".editor .errorMessage").classList.remove("hidden");
			document.querySelector(".editor .errorMessage").textContent = "Please fill out all required fields.";
			document.querySelector(".progressContainer").classList.add("hidden");
			document.querySelector(".editor").classList.remove("hidden");
			return;
		}
	}

	var content = [];
	for (var i = 0; i < contentFields.length; i++) {
		var currentField = contentFields[i];
		content.push(currentField.getValue());
	}
	formData.append("content", JSON.stringify(content));

	var itemID;
	fetch("/admin/news/bootstrap.php")
		.then((response) => response.json())
		.then((data) => {
			if (data.status === "success") {
				itemID = data.id;
			}
		})
		.then(() => {
			formData.append("id", itemID);
			fetch("/admin/news/create.php", {
				method: "POST",
				body: formData,
			})
				.then((response) => response.json())
				.then((result) => {
					if (result.status === "success") {
						document.querySelector(".responseContainer .title").textContent = "Done.";
						document.querySelector(".responseContainer .subtitle").textContent = "Your article has been uploaded.";
						document.querySelector(".responseContainer .message").textContent = "Item ID: " + result.id;
					} else {
						document.querySelector(".responseContainer .title").textContent = "Congratulations, you broke something.";
						document.querySelector(".responseContainer .subtitle").textContent = "Good going.";
						document.querySelector(".responseContainer .message").textContent = result.error;
					}

					document.querySelector(".progressContainer").classList.add("hidden");
					document.querySelector(".responseContainer").classList.remove("hidden");
				});
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
			formData.append(currentProperty.propertyName, currentPropertyValue.value);
		} else if (currentPropertyValue.fail) {
			document.querySelector(".editor .errorMessage").classList.remove("hidden");
			document.querySelector(".editor .errorMessage").textContent = "Please fill out all required fields.";
			document.querySelector(".progressContainer").classList.add("hidden");
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
		document.querySelector(".responseContainer .title").textContent = "Done.";
		document.querySelector(".responseContainer .subtitle").textContent = "The article has been updated.";
		document.querySelector(".responseContainer .message").textContent = "Item ID: " + result.id;
	} else {
		document.querySelector(".responseContainer .title").textContent = "Congratulations, you broke something.";
		document.querySelector(".responseContainer .subtitle").textContent = "Good going.";
		document.querySelector(".responseContainer .message").textContent = result.error;
	}

	document.querySelector(".progressContainer").classList.add("hidden");
	document.querySelector(".responseContainer").classList.remove("hidden");
}

async function deleteArticle() {
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
		document.querySelector(".responseContainer .title").textContent = "Done.";
		document.querySelector(".responseContainer .subtitle").textContent = "The article has been deleted.";
		document.querySelector(".responseContainer .message").textContent = "";
	} else {
		document.querySelector(".responseContainer .title").textContent = "Congratulations, you broke something.";
		document.querySelector(".responseContainer .subtitle").textContent = "Good going.";
		document.querySelector(".responseContainer .message").textContent = result.error;
	}

	document.querySelector(".progressContainer").classList.add("hidden");
	document.querySelector(".responseContainer").classList.remove("hidden");
}

function showErrorScreen() {
	//Hide the loading screen and show the error screen
	document.querySelector(".loadingContainer").classList.add("hidden");
	document.querySelector(".errorContainer").classList.remove("hidden");
}

function closeEditor() {
	window.top.postMessage("closeArticleEditor", "*");
}
