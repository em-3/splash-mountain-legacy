function showItemDetails(id) {
  document.querySelector(".itemDetailsContainer iframe").src =
    "/item/" + id + "/?embedded=true";
  document.querySelector(".itemDetailsContainer").classList.remove("hidden");
  document.body.classList.add("noScroll");
}

function hideItemDetails() {
  document.querySelector(".itemDetailsContainer").classList.add("hidden");
  document.body.classList.remove("noScroll");
}

//Listen for iframe requests
window.onmessage = function (e) {
  if (e.data.indexOf("details") === 0) {
    showItemDetails(e.data.substring(7));
  } else if (e.data === "closeDetails") {
    hideItemDetails();
  }
};

//Show admin console link if user has previously logged in
if (localStorage.getItem("adminAccess") === "true") {
  document.querySelector("header .links .admin").classList.remove("hidden");
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
