function showItemDetails(id) {
	document.querySelector(".itemDetailsContainer iframe").src =
		"/item/" + id + "/?embedded=true";
	document.querySelector(".itemDetailsContainer").classList.remove("hidden");
	document.body.classList.add("noScroll");
}

function showDatabaseItemEditor(id) {
	var iframe = document.querySelector(".itemDetailsContainer iframe");
	if (id) {
		iframe.src = "/admin/embeds/databaseItemEditor/?mode=editor&id=" + id;
	} else {
		iframe.src = "/admin/embeds/databaseItemEditor/?mode=newItem";
	}
	document.querySelector(".itemDetailsContainer").classList.remove("hidden");
}

function showArticleEditor(id) {
	var iframe = document.querySelector(".itemDetailsContainer iframe");
	if (id) {
		iframe.src = "/admin/embeds/articleEditor/?mode=editor&id=" + id;
	} else {
		iframe.src = "/admin/embeds/articleEditor/?mode=newArticle";
	}
	document.querySelector(".itemDetailsContainer").classList.remove("hidden");
}

function hideItemDetails() {
	document.querySelector(".itemDetailsContainer").classList.add("hidden");
	document.body.classList.remove("noScroll");
}

//Listen for iframe requests
window.addEventListener("message", function (e) {
	if (e.data.indexOf("details") === 0) {
		showItemDetails(e.data.substring(7));
	} else if (e.data === "closeDetails" || e.data === "closeEditor") {
		hideItemDetails();
	} else if (e.data.indexOf("navigateTo") === 0) {
		window.location.href = e.data.substring(10);
	}
});

//Highlight the proper link in the header for the current page
if (document.querySelector("header .links")) {
	var linkAssociations = {
		"login": null,
		"admin": "admin",
		"admin/database": "admin",
		"admin/news": "admin",
		"admin/audit": "admin",
		"database": "database",
		"item": "database",
		"news": "news",
		"article": "news",
		"about": "about",
		"/": "home"
	};
	var pathname = window.location.pathname;
	for (var key in linkAssociations) {
		if (pathname.indexOf(key) !== -1) {
			if (linkAssociations[key] === null) {
				break;
			}
			document.querySelector("header .links ." + linkAssociations[key]).classList.add("current");
			break;
		}
	}

	//Show admin console link if user has previously logged in
	if (localStorage.getItem("adminAccess") === "true") {
		var adminLink = document.querySelector("header .links .admin");
		adminLink.classList.remove("hidden");
		adminLink.addEventListener("contextmenu", function (e) {
			e.preventDefault();
			contextMenu.present({
				x: e.clientX,
				y: e.clientY,
				items: [
					{
						icon: "home",
						label: "Admin Home",
						callback: function () {
							window.location.href = "/admin";
						}
					},
					{
						icon: "database",
						label: "Database",
						callback: function () {
							window.location.href = "/admin/database";
						}
					},
					{
						icon: "file-document",
						label: "News List",
						callback: function () {
							window.location.href = "/admin/newsList";
						}
					},
					{
						icon: "play-list-search",
						label: "Audit Log",
						callback: function () {
							window.location.href = "/admin/audit-log";
						}
					},
					{
						icon: "file-add",
						label: "New Item",
						type: "active",
						callback: function () {
							showDatabaseItemEditor();
						}
					},
					{
						icon: "file-document",
						label: "New Article",
						type: "active",
						callback: function () {
							showArticleEditor();
						}
					}
				],
			});
		});
	}
}

//Listen for the Konami code
var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiCodeIndex = 0;

document.addEventListener("keydown", function (event) {
	if (event.keyCode === konamiCode[konamiCodeIndex]) {
		konamiCodeIndex++;
	} else {
		konamiCodeIndex = 0;
	}
	if (konamiCodeIndex === konamiCode.length) {
		window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
	}
});
