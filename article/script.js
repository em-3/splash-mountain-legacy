//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var id = params.get("id");
if (!id) {
	//Extract the ID from the last part of the URL
	var pieces = url.pathname.split("/");
	id = pieces[pieces.length - 2];
}

var loadedArticleDetails;
var timeOutHasExpired = false;

//Fetch the article details
if (id) {
	//Start a timeout
	setTimeout(function () {
		timeOutHasExpired = true;
		if (loadedArticleDetails) {
			showArticle();
		}
	}, 1000);
	fetch("/api/news/article/" + id)
		.then((response) => response.json())
		.then(checkTimeout, showErrorScreen);
} else {
	showErrorScreen();
}

function checkTimeout(articleDetails) {
	loadedArticleDetails = articleDetails;
	if (timeOutHasExpired) {
		showArticle();
	}
}

var contentFieldConstructors = {
	paragraph: function (content) {
		var element = document.createElement("p");

		//Sanitize content
		content = content.replaceAll(/</g, "&lt;");
		content = content.replaceAll(/>/g, "&gt;");
		content = content.replaceAll(/&/g, "&amp;");
		content = content.replaceAll(/"/g, "&quot;");
		content = content.replaceAll(/'/g, "&apos;");

		// Parse Markdown formatting
		// Bold
		content = content.replaceAll(/\*\*(.*?)\*\*/g, "<b>$1</b>");
		// Italics
		content = content.replaceAll(/\*(.*?)\*/g, "<i>$1</i>");
		// Strikethrough
		content = content.replaceAll(/~~(.*?)~~/g, "<s>$1</s>");
		// Underline
		content = content.replaceAll(/__(.*?)__/g, "<u>$1</u>");
		// Superscript
		content = content.replaceAll(/\^\^(.*?)\^\^/g, "<sup>$1</sup>");
		// Subscript
		content = content.replaceAll(/,,(.*?),,/g, "<sub>$1</sub>");
		// Links
		content = content.replaceAll(/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>");
		// Unordered Lists
		/* Example:
		- Item 1
		- Item 2
		- Item 3
		*/
		content = content.replaceAll(/^- (.*?)(\n|$)/gm, "<li>$1</li>");
		content = content.replaceAll(/((<li>(.*?)<\/li>)+)/gm, "<ul>$1</ul>\n");
		// Ordered Lists
		/* Example:
		# Item 1
		# Item 2
		# Item 3
		*/
		content = content.replaceAll(/^# (.*?)(\n|$)/gm, "<li>$1</li>");
		content = content.replaceAll(/^((<li>(.*?)<\/li>)+)/gm, "<ol>$1</ol>\n");

		// Parse HTML formatting
		element.innerHTML = content;
		return element;
	},
	header: function (content) {
		var element = document.createElement("h2");
		element.classList.add("header");
		element.textContent = content;
		return element;
	},
	subheader: function (content) {
		var element = document.createElement("h3");
		element.classList.add("subheader");
		element.textContent = content;
		return element;
	},
	image: function (content) {
		var container = document.createElement("div");
		container.classList.add("imageContainer");

		var thumbnail = document.createElement("img");
		thumbnail.classList.add("thumbnail");
		thumbnail.src = "/resources/" + content.image + "/thumbnail.jpg";
		container.appendChild(thumbnail);

		var image = document.createElement("img");
		image.classList.add("image");
		image.classList.add("hidden");
		(function (thumbnail, image) {
			image.onload = function () {
				thumbnail.classList.add("hidden");
				image.classList.remove("hidden");
			};
		})(thumbnail, image);
		image.src = "/resources/" + content.image + "/main.jpg";
		container.appendChild(image);

		var caption = document.createElement("p");
		caption.classList.add("caption");
		caption.textContent = content.caption;
		container.appendChild(caption);

		return container;
	},
	quote: function (content) {
		var container = document.createElement("div");
		container.classList.add("container");

		var quote = document.createElement("p");
		quote.classList.add("quote");
		quote.textContent = content.quote;
		var author = document.createElement("p");
		author.classList.add("author");
		author.textContent = "- " + content.author;

		container.appendChild(quote);
		container.appendChild(author);
		return container;
	},
	divider: function (content) {
		var element = document.createElement("hr");
		element.classList.add("divider");
		return element;
	}
};

function showArticle() {
	document.querySelector(".articleHeader .thumbnail").src = "/resources/" + loadedArticleDetails.thumbnail + "/main.jpg";
	document.querySelector(".articleHeader .title").textContent = loadedArticleDetails.title;
	document.querySelector(".articleHeader .subtitle").textContent = loadedArticleDetails.subtitle;
	document.querySelector(".articleHeader .authorImage").src = "/images/authors/" + loadedArticleDetails.author.toLowerCase().replaceAll(/[ _.]/g, "") + ".jpg";
	document.querySelector(".articleHeader .authorName").textContent = loadedArticleDetails.author;

	var content = JSON.parse(loadedArticleDetails.content);
	for (var i = 0; i < content.length; i++) {
		var currentSection = content[i];
		if (typeof currentSection === "string") {
			var element = document.createElement("p");
			element.textContent = currentSection;
		} else {
			var element = contentFieldConstructors[currentSection.type](currentSection.content);
		}
		document.querySelector(".articleContent").appendChild(element);
	}

	//Append a filled square to the last paragraph
	var paragraphs = document.querySelectorAll(".articleContent p");
	paragraphs[paragraphs.length - 1].appendChild(document.createTextNode(" \u25A0"));

	//Hide the loading screen and show the article
	document.querySelector(".articleViewer .loadingContainer").classList.add("hidden");
	document.querySelector(".articleViewer .articleDisplay").classList.remove("hidden");
	document.querySelector(".articleViewer .errorMessageContainer").classList.add("hidden");

	//Update the page title
	document.querySelector("title").textContent = loadedArticleDetails.title + " - Splash Mountain Legacy";
}

function showErrorScreen() {
	//Hide the loading screen and show the error screen
	document.querySelector(".loadingScreen").classList.add("hidden");
	document.querySelector(".errorScreen").classList.remove("hidden");
}
