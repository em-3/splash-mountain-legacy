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
		}
		document.querySelector(".articleContent").appendChild(element);
	}

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
