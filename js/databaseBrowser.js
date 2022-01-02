var filters = [
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
            "text"
        ]
    }
];

//Loop through each filter and create an element for for it.
for (var i = 0; i < filters.length; i++) {
    var currentFilter = filters[i];

    var filterElement = document.createElement("div");
    filterElement.classList.add("filter");
    filterElement.classList.add(currentFilter.id);

    var filterName = document.createElement("p");
    filterName.classList.add("name");
    filterName.textContent = currentFilter.label + ":";

    var filterSelect = document.createElement("select");
    filterSelect.setAttribute("name", currentFilter.id);
    filterSelect.addEventListener("change", function () {
        refreshResults();
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
    document.querySelector(".filterBar").appendChild(filterElement);
}

function refreshResults () {
    var PHPParams = "";
    var character = "?";
    for (var i = 0; i < filters.length; i++) {
        //Get the selected option for this filter's select element.
        var filterElement = document.querySelector("select[name='" + filters[i].id + "']");
        var filterValue = filterElement.options[filterElement.selectedIndex].value;
        if (filterValue != "" && filterValue != "All") {
            PHPParams += character + filters[i].id + "=" + filterValue;
            character = "&";
        }
    }

    //Clear the current results from .resultsContainer
        while (document.querySelector(".resultsContainer").firstChild) {
        document.querySelector(".resultsContainer").removeChild(document.querySelector(".resultsContainer").firstChild);
    }

    //Fetch new results
    fetch("/api/search/" + PHPParams).then(response => response.json()).then((data) => {
        if (data.length === 0) {
            var noResults = document.createElement("p");
            noResults.className = "noResults";
            noResults.textContent = "No results found.";
            document.querySelector(".resultsContainer").appendChild(noResults);
        } else {
            for (var i = 0; i < data.length; i++) {
                var currentItemData = data[i];

                var resultElement = document.createElement("div");
                resultElement.className = "result";
                (function (id) {
                    resultElement.onclick = function () {
                        window.top.postMessage("details" + id, "*");
                    }
                })(currentItemData.id)

                var headerContainer = document.createElement("div");
                headerContainer.classList.add("headerContainer");

                var name = document.createElement("h3");
                name.classList.add("name");
                name.textContent = currentItemData.name;

                var type = document.createElement("p");
                type.classList.add("type");
                type.textContent = currentItemData.type;

                var author = document.createElement("p");
                author.classList.add("author");
                author.textContent = currentItemData.author.replace(/\[([^\][]+)]/g, "");

                headerContainer.appendChild(name);
                headerContainer.appendChild(type);

                resultElement.appendChild(headerContainer);
                resultElement.appendChild(author);
                document.querySelector(".resultsContainer").appendChild(resultElement);
            }
        }

        //Hide the loading screen and show the database browser
        document.querySelector(".loadingScreen").classList.add("hidden");
        document.querySelector(".browser").classList.remove("hidden");
    }, (error) => {
        var errorMessage = document.createElement("p");
        errorMessage.className = "errorMessage";
        errorMessage.textContent = "Something went wrong.";
        document.querySelector(".resultsContainer").appendChild(errorMessage);

        //Hide the loading screen and show the database browser
        document.querySelector(".loadingScreen").classList.add("hidden");
        document.querySelector(".browser").classList.remove("hidden");
    });
}

refreshResults();
