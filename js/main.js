//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var embedded = params.get("embedded");

function showItemDetails(id) {
	if (embedded) {
		window.location.href = "/item/" + id + "/?embedded=true&returnTo=" + encodeURIComponent(window.location.href);
	} else {
		document.querySelector(".itemDetailsContainer iframe").src = "/item/" + id + "/?embedded=true";
		document.querySelector(".itemDetailsContainer").classList.remove("hidden");
		document.body.classList.add("noScroll");
	}
}

function showDatabaseItemEditor(id) {
	var url;
	if (id) {
		url = "/admin/embeds/databaseItemEditor/?mode=editor&id=" + id;
	} else {
		url = "/admin/embeds/databaseItemEditor/?mode=newItem";
	}
	if (embedded) {
		window.location.href = url;
	} else {
		var iframe = document.querySelector(".itemDetailsContainer iframe");
		iframe.src = url;
		document.querySelector(".itemDetailsContainer").classList.remove("hidden");
	}
}

function showArticleEditor(id) {
	var url;
	if (id) {
		url = "/admin/embeds/articleEditor/?mode=editor&id=" + id;
	} else {
		url = "/admin/embeds/articleEditor/?mode=newArticle";
	}
	if (embedded) {
		window.location.href = url;
	} else {
		var iframe = document.querySelector(".itemDetailsContainer iframe");
		iframe.src = url;
		document.querySelector(".itemDetailsContainer").classList.remove("hidden");
	}
}

function hideItemDetails() {
	document.querySelector(".itemDetailsContainer").classList.add("hidden");
	document.body.classList.remove("noScroll");
	for (browser in refreshableDatabaseBrowsers) {
			refreshableDatabaseBrowsers[browser].refreshResults("refreshExisting");
	}
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
