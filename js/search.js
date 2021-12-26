var timeoutID = null;

var searchBar = {
    onfocus: function () {
        document.querySelector("header").classList.add("searchActive");
    },
    onblur: function () {
        document.querySelector("header").classList.remove("searchActive");
    },

    showLoadingContainer: function () {
        document.querySelector(".searchResultsContainer .loadingContainer").classList.remove("hidden");
        document.querySelector(".searchResultsContainer .resultsContainer").classList.add("hidden");
    },
    showResultsContainer: function () {
        document.querySelector(".searchResultsContainer .loadingContainer").classList.add("hidden");
        document.querySelector(".searchResultsContainer .resultsContainer").classList.remove("hidden");
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
            fetch("/api/search/?query=" + query).then(response => response.json()).then((results) => {
                searchBar.clearSearchResults();

                if (results.length === 0) {
                    var noResultsElement = document.createElement("p");
                    noResultsElement.className = "message";
                    noResultsElement.textContent = "No results found.";
                    document.querySelector(".searchResultsContainer .resultsContainer").appendChild(noResultsElement);
                } else {
                    for (var i = 0; i < results.length; i++) {
                        var currentItemData = results[i];

                        var resultElement = document.createElement("div");
                        resultElement.className = "result";
                        (function (id) {
                            resultElement.onmousedown = function () {
                                showItemDetails(id);
                            }
                        })(currentItemData.id)

                        var nameElement = document.createElement("h3");
                        nameElement.className = "name";
                        nameElement.textContent = currentItemData.name;

                        var infoContainerElement = document.createElement("div");
                        infoContainerElement.className = "infoContainer";

                        var parkElement = document.createElement("p");
                        parkElement.className = "park";
                        parkElement.textContent = currentItemData.park;
                        infoContainerElement.appendChild(parkElement);

                        var typeElement = document.createElement("p");
                        typeElement.className = "type";
                        typeElement.textContent = currentItemData.type;
                        infoContainerElement.appendChild(typeElement);

                        var authorElement = document.createElement("p");
                        authorElement.className = "author";
                        authorElement.textContent = currentItemData.author;
                        infoContainerElement.appendChild(authorElement);

                        resultElement.appendChild(nameElement);
                        resultElement.appendChild(infoContainerElement);
                        document.querySelector(".searchResultsContainer .resultsContainer").appendChild(resultElement);
                    }
                    searchBar.showResultsContainer();
                }
            }, (error) => {
                var errorMessageElement = document.createElement("p");
                errorMessageElement.className = "message";
                errorMessageElement.textContent = "Something went wrong.";
                document.querySelector(".searchResultsContainer .resultsContainer").appendChild(errorMessageElement);
                searchBar.showResultsContainer();
            }
        )}, 2000);
    },
    clearSearchResults: function () {
        while (document.querySelector(".searchResultsContainer .resultsContainer").firstChild) {
            document.querySelector(".searchResultsContainer .resultsContainer").removeChild(document.querySelector(".searchResultsContainer .resultsContainer").firstChild);
        }
    }
};