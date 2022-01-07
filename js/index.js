//Populate the database additions container with the newest items
fetch("/api/search/?orderBy=newest&min=1&max=15")
    .then(response => response.json())
    .then(data => {
        var items = data.results;
        var container = document.querySelector(".databaseAdditions .content")
        items.forEach(item => {
            var currentItemElement = document.createElement("div");
            currentItemElement.className = "item";
            
            var imgElement = document.createElement("img");
            imgElement.src = "/resources/" + item.id + "/thumbnail";

            var infoElement = document.createElement("div");
            infoElement.className = "info";

            var titleElement = document.createElement("h3");
            titleElement.className = "title";
            titleElement.textContent = item.name;
            
            var subtitleElement = document.createElement("div");
            subtitleElement.className = "subtitle";

            var parkElement = document.createElement("p");
            parkElement.textContent = item.park;
            subtitleElement.appendChild(parkElement);
            var typeElement = document.createElement("p");
            typeElement.textContent = item.type;
            subtitleElement.appendChild(typeElement);
            if (item.author) {
                var authorElement = document.createElement("p");
                authorElement.textContent = item.author.replace(/\[([^\][]+)]/g, "");
                subtitleElement.appendChild(authorElement);
            }

            infoElement.appendChild(titleElement);
            infoElement.appendChild(subtitleElement);
            currentItemElement.appendChild(imgElement);
            currentItemElement.appendChild(infoElement);

            container.appendChild(currentItemElement);
        });
    });

//Listen for iframe requests
window.onmessage = function(e) {
    if (e.data.indexOf("details") === 0) {
        showItemDetails(e.data.substring(7));
    } else if (e.data === "closeDetails") {
        hideItemDetails();
    }
};

function showItemDetails(id) {
    document.querySelector(".itemDetailsContainer iframe").src = "/viewer.html?id=" + id;
    document.querySelector(".itemDetailsContainer").classList.remove("hidden");
    document.body.classList.add("noScroll");
}

function hideItemDetails() {
    document.querySelector(".itemDetailsContainer").classList.add("hidden");
    document.body.classList.remove("noScroll");
}

//Listen for the Konami code
var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiCodeIndex = 0;

document.addEventListener("keydown", function(event) {
    if (event.keyCode === konamiCode[konamiCodeIndex]) {
        konamiCodeIndex++;
    } else {
        konamiCodeIndex = 0;
    }
    if (konamiCodeIndex === konamiCode.length) {
        //Redirect the page to a rickroll
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
});