function selectTab(listName) {
    //Deselect all tabs
    var tabs = document.querySelectorAll(".tabContainer .tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected");
    }
    //Hide all lists
    var lists = document.querySelectorAll(".list");
    for (var i = 0; i < lists.length; i++) {
        lists[i].classList.add("hidden");
    }

    //Populate the selected list
    switch (listName) {
        case "database":
            databaseList.refreshResults();
            break;
        case "news":
            newsList.refreshResults();
            break;
    }

    //Select the correct tab and show the correct list
    var tab = document.querySelector(".tab." + listName);
    tab.classList.add("selected");
    var list = document.querySelector(".list." + listName);
    list.classList.remove("hidden");
}

var databaseList = {
    searchRange: {
        min: 1,
        max: 21
    },
    searchBar: {
        timeoutID: null,
        oninput: function () {
            var query = document.querySelector(".searchField").value;

            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
            }

            document.querySelector(".list.database .loadingContainer").classList.remove("hidden");
            document.querySelector(".list.database .resultsContainer").classList.add("hidden");
            document.querySelector(".list.database .errorMessageContainer").classList.add("hidden")
            
            //Wait a second before updating the search results
            this.timeoutID = setTimeout(databaseList.refreshResults, 1000);
        }, 
        onchange: function () {
            databaseList.refreshResults();
        }
    },
    filters: [
        {
        id: "park",
        label: "Park",
        values: [
            "All",
            "WDW",
            "DL",
            "TDL"
        ]
    },
    {
        id: "type",
        label: "Type",
        values: [
            "All",
            "image",
            "video",
            "audio",
            "date",
            "text"
        ]
    }
    ],
    refreshResults: function (preservePreviousResults) {
        var PHPParams = "";
        var character = "?";

        var filterValue = document.querySelector(".list.database .filters .searchField input").value;
        if (filterValue != "") {
            PHPParams += character + "query=" + filterValue;
            character = "&";
        }

        for (var i = 0; i < databaseList.filters.length; i++) {
            //Get the selected option for this filter's select element.
            var filterElement = document.querySelector("select[name='" + databaseList.filters[i].id + "']");
            var filterValue = filterElement.options[filterElement.selectedIndex].value;
            if (filterValue != "" && filterValue != "All") {
                PHPParams += character + databaseList.filters[i].id + "=" + filterValue;
                character = "&";
            }
        }

        if (!preservePreviousResults) {
            //Clear the current results
            while (document.querySelector(".list.database .resultsContainer").firstChild) {
                document.querySelector(".list.database .resultsContainer").removeChild(document.querySelector(".list.database .resultsContainer").firstChild);
            }
            //Reset min and max
            databaseList.searchRange.min = 1;
            databaseList.searchRange.max = 21;
        }

        //Fetch new results
        fetch("/api/search/" + PHPParams + character + "min=" + databaseList.searchRange.min + "&max=" + databaseList.searchRange.max + "&show_hidden=true")
            .then(response => response.json())
            .then((data) => {
            if (!preservePreviousResults && data.length === 0) {
                var noResults = document.createElement("p");
                noResults.className = "noResults";
                noResults.textContent = "No results found.";
                document.querySelector(".list.database .resultsContainer").appendChild(noResults);
            } else if (preservePreviousResults && data.length === 0) {
                var loadMoreButton = document.querySelector(".list.database .loadMoreButton");
                loadMoreButton.parentElement.removeChild(loadMoreButton);
            } else {
                if (preservePreviousResults) {
                    var loadMoreButton = document.querySelector(".list.database .loadMoreButton");
                    loadMoreButton.parentElement.removeChild(loadMoreButton);
                }

                for (var i = 0; i < data.length; i++) {
                    var currentItemData = data[i];

                    var resultElement = document.createElement("div");
                    resultElement.className = "result";
                    (function (id) {
                        resultElement.onclick = function () {
                            showDatabaseItemEditor(id);
                        }
                    })(currentItemData.id)

                    if (currentItemData.type === "image") {
                        var pictureElement = null;
                        var imgElement = document.createElement("img");
                        imgElement.className = "image";
                        imgElement.src = "/resources/" + currentItemData.image + "/thumbnail";
                    } else if (currentItemData.type === "video") {
                        var pictureElement = null;
                        var imgElement = document.createElement("img");
                        imgElement.className = "image";
                        imgElement.src = "https://img.youtube.com/vi/" + currentItemData.video_id + "/mqdefault.jpg";
                    } else {
                        var pictureElement = document.createElement("picture");
                        pictureElement.className = "image";

                        var sourceElement = document.createElement("source");
                        sourceElement.srcset = "/images/icons/types/" + currentItemData.type + "-white.png";
                        sourceElement.setAttribute("media", "(prefers-color-scheme: dark)");

                        var imgElement = document.createElement("img");
                        imgElement.src = "/images/icons/types/" + currentItemData.type + "-black.png";

                        pictureElement.appendChild(sourceElement);
                        pictureElement.appendChild(imgElement);
                    }

                    var rightSideContainer = document.createElement("div");
                    rightSideContainer.className = "right";

                    if (currentItemData.hidden === "1") {
                        resultElement.classList.add("hiddenItem");
                        var hiddenElement = document.createElement("p");
                        hiddenElement.textContent = "Hidden Item";
                        rightSideContainer.appendChild(hiddenElement);
                    }

                    var nameElement = document.createElement("h3");
                    nameElement.className = "name";
                    nameElement.textContent = currentItemData.name;

                    var descriptionElement = document.createElement("p");
                    descriptionElement.className = "description";
                    descriptionElement.textContent = currentItemData.description;

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

                    if (currentItemData.author) {
                        var authorElement = document.createElement("p");
                        authorElement.className = "author";
                        authorElement.textContent = currentItemData.author.replace(/\[([^\][]+)]/g, "");
                        infoContainerElement.appendChild(authorElement);
                    }

                    rightSideContainer.appendChild(nameElement);
                    rightSideContainer.appendChild(infoContainerElement);
                    rightSideContainer.appendChild(descriptionElement);

                    if (pictureElement) {
                        resultElement.appendChild(pictureElement);
                    } else if (imgElement) {
                        resultElement.appendChild(imgElement);
                    }
                    resultElement.appendChild(rightSideContainer);
                    document.querySelector(".list.database .resultsContainer").appendChild(resultElement);
                }

                if (data.length === databaseList.searchRange.max - databaseList.searchRange.min) {
                    var loadMoreButton = document.createElement("button");
                    loadMoreButton.className = "loadMoreButton";
                    loadMoreButton.textContent = "Load More";
                    loadMoreButton.addEventListener("click", function () {
                        databaseList.loadMoreResults();
                    });
                    document.querySelector(".list.database .resultsContainer").appendChild(loadMoreButton);
                }
            }

            //Hide the loading screen and show the results container
            document.querySelector(".list.database .loadingContainer").classList.add("hidden");
            document.querySelector(".list.database .resultsContainer").classList.remove("hidden");
            document.querySelector(".list.database .errorMessageContainer").classList.add("hidden");
        }, (error) => {
            document.querySelector(".list.database .errorMessageContainer .title").textContent = "Something Went Wrong";
            document.querySelector(".list.database .errorMessageContainer .subtitle").textContent = "Failed to load database items.";

            //Hide the loading screen and show the error message container
            document.querySelector(".list.database .loadingContainer").classList.add("hidden");
            document.querySelector(".list.database .resultsContainer").classList.add("hidden");
            document.querySelector(".list.database .errorMessageContainer").classList.remove("hidden");
        });
    },
    loadMoreResults: function () {
        this.searchRange.min += 20;
        this.searchRange.max += 20;
        this.refreshResults(true);
    }
}

function showNewItemEditor () {
    document.querySelector(".databaseItemEditorContainer iframe").src = "/admin/embeds/databaseItemEditor/index.html?mode=newItem"; //FIXME Change to .php

    document.querySelector(".overlay").classList.add("active");
    document.querySelector(".databaseItemEditorContainer").classList.remove("hidden");
}

function showDatabaseItemEditor (itemID) {
    document.querySelector(".databaseItemEditorContainer iframe").src = "/admin/embeds/databaseItemEditor/index.html?mode=editor&id=" + itemID; //FIXME Change to .php

    document.querySelector(".overlay").classList.add("active");
    document.querySelector(".databaseItemEditorContainer").classList.remove("hidden");
}

function hideItemEditor () {
    document.querySelector(".overlay").classList.remove("active");
    document.querySelector(".databaseItemEditorContainer").classList.add("hidden");

    setTimeout(function () {
        document.querySelector(".databaseItemEditorContainer iframe").src = "about:blank";
    }, 500);
}

var newsList = {
    searchRange: {
        min: 1,
        max: 21
    },
    searchBar: {
        timeoutID: null,
        oninput: function () {
            var query = document.querySelector(".searchField").value;

            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
            }

            document.querySelector(".list.news .loadingContainer").classList.remove("hidden");
            document.querySelector(".list.news .resultsContainer").classList.add("hidden");
            document.querySelector(".list.news .errorMessageContainer").classList.add("hidden")
            
            //Wait a second before updating the search results
            this.timeoutID = setTimeout(newsList.refreshResults, 1000);
        }, 
        onchange: function () {
            newsList.refreshResults();
        }
    },
    refreshResults: function (preservePreviousResults) {
        var PHPParams = "";
        var character = "?";

        var filterValue = document.querySelector(".list.news .filters .searchField input").value;
        if (filterValue != "") {
            PHPParams += character + "query=" + filterValue;
            character = "&";
        }

        if (!preservePreviousResults) {
            //Clear the current results
            while (document.querySelector(".list.news .resultsContainer").firstChild) {
                document.querySelector(".list.news .resultsContainer").removeChild(document.querySelector(".list.news .resultsContainer").firstChild);
            }
        }

        //Fetch new results
        fetch("/api/news/list/" + PHPParams + character + "min=" + newsList.searchRange.min + "&max=" + newsList.searchRange.max + "&show_unpublihshed=true")
            .then(response => response.json())
            .then((data) => {
            if (!preservePreviousResults && data.length === 0) {
                var noResults = document.createElement("p");
                noResults.className = "noResults";
                noResults.textContent = "No results found.";
                document.querySelector(".list.news .resultsContainer").appendChild(noResults);
            } else if (preservePreviousResults && data.length === 0) {
                var loadMoreButton = document.querySelector(".list.news .loadMoreButton");
                loadMoreButton.parentElement.removeChild(loadMoreButton);
            } else {
                if (preservePreviousResults) {
                    var loadMoreButton = document.querySelector(".list.news .loadMoreButton");
                    loadMoreButton.parentElement.removeChild(loadMoreButton);
                }

                for (var i = 0; i < data.length; i++) {
                    var currentItemData = data[i];

                    if (currentItemData.scene) {continue;}

                    var resultElement = document.createElement("div");
                    resultElement.className = "result";
                    (function (id) {
                        resultElement.onclick = function () {
                            showArticleEditor(id);
                        }
                    })(currentItemData.id)

                    var pictureElement = null;
                    var imgElement = document.createElement("img");
                    imgElement.className = "image";
                    imgElement.src = "/resources/" + currentItemData.thumbnail + "/thumbnail";

                    var rightSideContainer = document.createElement("div");
                    rightSideContainer.className = "right";

                    if (currentItemData.hidden === "1") {
                        resultElement.classList.add("hiddenItem");
                        var hiddenElement = document.createElement("p");
                        hiddenElement.textContent = "Hidden Item";
                        rightSideContainer.appendChild(hiddenElement);
                    }

                    var nameElement = document.createElement("h3");
                    nameElement.className = "title";
                    nameElement.textContent = currentItemData.title;

                    var descriptionElement = document.createElement("p");
                    descriptionElement.className = "subtitle";
                    descriptionElement.textContent = currentItemData.subtitle;

                    var infoContainerElement = document.createElement("div");
                    infoContainerElement.className = "infoContainer";

                    var publicationDateElement = document.createElement("p");
                    publicationDateElement.className = "publicationDate";
                    publicationDateElement.textContent = currentItemData.publicationDate;
                    infoContainerElement.appendChild(publicationDateElement);

                    var authorElement = document.createElement("p");
                    authorElement.className = "author";
                    authorElement.textContent = currentItemData.author;
                    infoContainerElement.appendChild(authorElement);

                    rightSideContainer.appendChild(nameElement);
                    rightSideContainer.appendChild(descriptionElement);
                    rightSideContainer.appendChild(infoContainerElement);

                    resultElement.appendChild(imgElement);
                    resultElement.appendChild(rightSideContainer);
                    document.querySelector(".list.news .resultsContainer").appendChild(resultElement);
                }

                if (data.length === newsList.searchRange.max - newsList.searchRange.min) {
                    var loadMoreButton = document.createElement("button");
                    loadMoreButton.className = "loadMoreButton";
                    loadMoreButton.textContent = "Load More";
                    loadMoreButton.addEventListener("click", function () {
                        newsList.loadMoreResults();
                    });
                    document.querySelector(".list.news .resultsContainer").appendChild(loadMoreButton);
                }
            }

            //Hide the loading screen and show the results container
            document.querySelector(".list.news .loadingContainer").classList.add("hidden");
            document.querySelector(".list.news .resultsContainer").classList.remove("hidden");
            document.querySelector(".list.news .errorMessageContainer").classList.add("hidden");
        }, (error) => {
            document.querySelector(".list.news .errorMessageContainer .title").textContent = "Something Went Wrong";
            document.querySelector(".list.news .errorMessageContainer .subtitle").textContent = "Failed to load news articles.";

            //Hide the loading screen and show the error message container
            document.querySelector(".list.news .loadingContainer").classList.add("hidden");
            document.querySelector(".list.news .resultsContainer").classList.add("hidden");
            document.querySelector(".list.news .errorMessageContainer").classList.remove("hidden");
        });
    },
    loadMoreResults: function () {
        this.searchRange.min += 20;
        this.searchRange.max += 20;
        this.refreshResults(true);
    }
}

function showNewArticleEditor () {
    document.querySelector(".articleEditorContainer iframe").src = "/admin/embeds/articleEditor/index.html?mode=newArticle"; //FIXME Change to .php

    document.querySelector(".overlay").classList.add("active");
    document.querySelector(".articleEditorContainer").classList.remove("hidden");
}

function showExistingArticleEditor (articleID) {
    document.querySelector(".articleEditorContainer iframe").src = "/admin/embeds/articleEditor/index.html?mode=editor&id=" + articleID; //FIXME Change to .php

    document.querySelector(".overlay").classList.add("active");
    document.querySelector(".articleEditorContainer").classList.remove("hidden");
}

function hideArticleEditor () {
    document.querySelector(".overlay").classList.remove("active");
    document.querySelector(".articleEditorContainer").classList.add("hidden");

    setTimeout(function () {
        document.querySelector(".articleEditorContainer iframe").src = "about:blank";
    }, 500);
}

//Loop through each filter and create an element for for it.
for (var i = 0; i < databaseList.filters.length; i++) {
    var currentFilter = databaseList.filters[i];

    var filterElement = document.createElement("div");
    filterElement.classList.add("optionMenu");
    filterElement.classList.add(currentFilter.id);

    var filterName = document.createElement("p");
    filterName.classList.add("name");
    filterName.textContent = currentFilter.label + ":";

    var filterSelect = document.createElement("select");
    filterSelect.setAttribute("name", currentFilter.id);
    filterSelect.addEventListener("change", function () {
        databaseList.refreshResults();
    });

    for (var j = 0; j < currentFilter.values.length; j++) {
        var filterSelectOption = document.createElement("option");
        filterSelectOption.setAttribute("value", currentFilter.values[j]);
        filterSelectOption.textContent = currentFilter.values[j];
        if (j === 0) {
            filterSelectOption.setAttribute("selected", true);
        }
        filterSelect.appendChild(filterSelectOption);
    }

    filterElement.appendChild(filterName);
    filterElement.appendChild(filterSelect);
    document.querySelector(".list.database .filters .optionMenus").appendChild(filterElement);
}

databaseList.refreshResults();
newsList.refreshResults();

window.onmessage = function(e) {
    if (e.data === "closeEditor") {
        hideItemEditor();
        // databaseList.refreshResults();
    }
};

localStorage.setItem("adminAccess", "true");