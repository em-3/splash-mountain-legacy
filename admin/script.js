//Get user profile information
fetch("/api/profile/index.php")
	.then((reponse) => reponse.json())
	.then((data) => {
		if (data.status === "success") {
			var profileInfo = data.user_data;
			document.querySelector(".profileInformation .profilePicture").src = "https://cdn.discordapp.com/avatars/" + profileInfo.id + "/" + profileInfo.avatar_hash;
			document.querySelector(".profileInformation .name").textContent = profileInfo.username;
			var authorizationLevel;
			switch (profileInfo.clearance) {
				case "0":
					authorizationLevel = "Admin";
					break;
				case "1":
					authorizationLevel = "Launch Team";
					break;
			}
			document.querySelector(".profileInformation .authorizationLevel").textContent = authorizationLevel;
		} else {
			document.querySelector(".profileInformation .name").textContent = "Error";
			document.querySelector(".profileInformation .authorizationLevel").textContent = "Failed to load user profile.";
		}
	});

//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var openEditor = params.get("openEditor");
var id = params.get("id");

if (openEditor && openEditor === "item") {
	//Open the item editor
	showDatabaseItemEditor(id);
} else if (openEditor && openEditor === "article") {
	//Open the article editor
	showArticleEditor(id);
}

document.querySelector(".actions .create").addEventListener("click", function (e) {
	contextMenu.present({
		x: e.clientX,
		y: e.clientY,
		items: [
			{
				icon: "file-add",
				label: "Item",
				callback: function () {
					showDatabaseItemEditor();
				}
			},
			{
				icon: "file-document",
				label: "Article",
				callback: function () {
					showArticleEditor();
				}
			},
		]
	})
});

async function logout() {
	var confirm = await dialog.confirm("Logout", "Are you sure you want to logout?", {
		cancellable: true,
		buttons: [
			{
				text: "Logout",
				type: "active",
			},
		],
	});
	if (confirm !== 0) {
		return;
	}

	window.location.href = "/logout.php";
}

localStorage.setItem("adminAccess", "true");
