//Populate the database additions container with the newest items
fetch("/api/search/?sort_by=date_added&min=1&max=15")
    .then(response => response.json())
    .then(data => {
        var container = document.querySelector(".databaseAdditions .content");
        data.forEach(item => {
            var currentItemElement = document.createElement("div");
            currentItemElement.className = "item";
            (function (id) {
                currentItemElement.onclick = function () {
                    showItemDetails(id);
                };
            })(item.id);
            
            var imageContainer = document.createElement("div");
            imageContainer.className = "imageContainer";

            if (item.type === "image") {
                var pictureElement = null;
                var imgElement = document.createElement("img");
                imgElement.src = "/resources/" + item.id + "/thumbnail";
                imageContainer.appendChild(imgElement);
            } else {
                var pictureElement = document.createElement("picture");

                var sourceElement = document.createElement("source");
                sourceElement.srcset = "/images/icons/types/" + item.type + "-white.png";
                sourceElement.setAttribute("media", "(prefers-color-scheme: dark)");

                var imgElement = document.createElement("img");
                imgElement.src = "/images/icons/types/" + item.type + "-black.png";

                pictureElement.appendChild(sourceElement);
                pictureElement.appendChild(imgElement);
                imageContainer.appendChild(pictureElement);
            }

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

            currentItemElement.appendChild(imageContainer);
            currentItemElement.appendChild(infoElement);

            container.appendChild(currentItemElement);
        });
        document.querySelector(".databaseAdditions .loading").classList.add("hidden");
        container.classList.remove("hidden");
    }, error => {
        document.querySelector(".databaseAdditions .loading").classList.add("hidden");
        document.querySelector(".databaseAdditions .error").classList.remove("hidden");
    });