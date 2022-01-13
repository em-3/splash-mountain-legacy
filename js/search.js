var timeoutID = null;

var searchBar = {
    onfocus: function () {
        document.querySelector(".searchBox .searchField").focus();
        document.body.classList.add("noScroll");
        document.querySelector("header").classList.add("searchActive");
    },
    onblur: function () {
        if (document.querySelector(".searchBox .searchField").value == "") {
            document.body.classList.remove("noScroll");
            document.querySelector("header").classList.remove("searchActive");
        }
    },

    showLoadingContainer: function () {
        document.querySelector(".searchResultsContainer .loadingContainer").classList.remove("hidden");
        document.querySelector(".searchResultsContainer .resultsContainer").classList.add("hidden");
        document.querySelector(".searchResultsContainer .errorMessageContainer").classList.add("hidden");
    },
    showResultsContainer: function () {
        document.querySelector(".searchResultsContainer .loadingContainer").classList.add("hidden");
        document.querySelector(".searchResultsContainer .resultsContainer").classList.remove("hidden");
        document.querySelector(".searchResultsContainer .errorMessageContainer").classList.add("hidden");
    },
    showErrorMessageContainer: function (title, subtitle) {
        document.querySelector(".searchResultsContainer .errorMessageContainer .title").textContent = title;
        document.querySelector(".searchResultsContainer .errorMessageContainer .subtitle").textContent = subtitle;

        document.querySelector(".searchResultsContainer .loadingContainer").classList.add("hidden");
        document.querySelector(".searchResultsContainer .resultsContainer").classList.add("hidden");
        document.querySelector(".searchResultsContainer .errorMessageContainer").classList.remove("hidden");
    },
    
    close: function () {
        document.querySelector(".searchBox .searchField").value = "";
        document.querySelector(".searchBox .searchField").blur();
        searchBar.onblur();
        clearTimeout(timeoutID);
        setTimeout(function () {
            searchBar.clearSearchResults();
            searchBar.showResultsContainer();
        }, 200);
    },

    loadResultsFromRange: function (query, min, max) {
        return new Promise((resolve, reject) => {
            fetch("/api/search/?query=" + query + "&min=" + min + "&max=" + max).then(response => response.json()).then((results) => {
                resolve(results);
            }, (error) => {
                reject(error);
            });
        });
    },
    generateResultElement: function (resultItem) {
        var resultElement = document.createElement("div");
        resultElement.className = "listItem";
        (function (id) {
            resultElement.onmousedown = function () {
                showItemDetails(id);
            }
        })(resultItem.id)

        if (resultItem.type === "image") {
            var imgElement = document.createElement("img");
            imgElement.className = "image";
            imgElement.src = "/resources/" + resultItem.id + "/thumbnail";
        } else if (currentItemData.type === "video") {
            var pictureElement = null;
            var imgElement = document.createElement("img");
            imgElement.className = "image";
            imgElement.src = "https://img.youtube.com/vi/" + currentItemData.video_id + "/mqdefault.jpg";
        } else {
            var pictureElement = document.createElement("picture");
            pictureElement.className = "image";

            var sourceElement = document.createElement("source");
            sourceElement.srcset = "/images/icons/types/" + resultItem.type + "-white.png";
            sourceElement.setAttribute("media", "(prefers-color-scheme: dark)");

            var imgElement = document.createElement("img");
            imgElement.src = "/images/icons/types/" + resultItem.type + "-black.png";

            pictureElement.appendChild(sourceElement);
            pictureElement.appendChild(imgElement);
        }

        var rightSideContainer = document.createElement("div");
        rightSideContainer.className = "right";

        var nameElement = document.createElement("h3");
        nameElement.className = "name";
        nameElement.textContent = resultItem.name;

        var infoContainerElement = document.createElement("div");
        infoContainerElement.className = "infoContainer";

        var parkElement = document.createElement("p");
        parkElement.className = "park";
        parkElement.textContent = resultItem.park;
        infoContainerElement.appendChild(parkElement);

        var typeElement = document.createElement("p");
        typeElement.className = "type";
        typeElement.textContent = resultItem.type;
        infoContainerElement.appendChild(typeElement);

        if (resultItem.author) {
            var authorElement = document.createElement("p");
            authorElement.className = "author";
            authorElement.textContent = resultItem.author.replace(/\[([^\][]+)]/g, "");
            infoContainerElement.appendChild(authorElement);
        }

        rightSideContainer.appendChild(nameElement);
        rightSideContainer.appendChild(infoContainerElement);

        resultElement.appendChild(pictureElement || imgElement);
        resultElement.appendChild(rightSideContainer);
        return resultElement;
    },
    updateSearchResults: function () {
        var query = document.querySelector(".searchField").value;

        if (query.length === 0) {
            this.clearSearchResults();
            this.showResultsContainer();
            return;
        }

        if (timeoutID) {
            clearTimeout(timeoutID);
        }

        this.showLoadingContainer();
        
        //Wait two seconds before updating the search results
        timeoutID = setTimeout(function () {
            //Fetch new results
            searchBar.loadResultsFromRange(query, searchRange.min, searchRange.max).then((results) => {
                if (!preservePreviousResults) {
                    searchBar.clearSearchResults();
                }

                if (results.length === 0) {
                    searchBar.clearSearchResults();
                    searchBar.showErrorMessageContainer("No Results Found", "We couldn't find any matching items in the database.");
                } else {
                    for (var i = 0; i < results.length; i++) {
                        document.querySelector(".searchResultsContainer .resultsContainer").appendChild(searchBar.generateResultElement(results[i]));
                    }

                    searchBar.showResultsContainer();
                }
            }, (error) => {
                searchBar.clearSearchResults();
                searchBar.showErrorMessageContainer("Something Went Wrong", "Unable to load results.");
            });
        }, 1000);
    },
    clearSearchResults: function () {
        while (document.querySelector(".searchResultsContainer .resultsContainer").firstChild) {
            document.querySelector(".searchResultsContainer .resultsContainer").removeChild(document.querySelector(".searchResultsContainer .resultsContainer").firstChild);
        }
    }
};