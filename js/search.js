function updateSearchResults() {
    var query = document.querySelector(".searchField").value;
    
    //Wait two seconds before updating the search results
    setTimeout(function () {
        //Fetch new results
        fetch("/api/search/?q=" + query).then(response => response.json()).then((results) => {
            if (results.length === 0) {
                var noResultsElement = document.createElement("p");
                noResultsElement.className = "message";
                noResultsElement.textContent = "No results found.";
                document.querySelector(".resultsContainer").appendChild(noResultsElement);
            } else {
                for (var i = 0; i < results.length; i++) {
                    var currentItemData = results[i];

                    var resultElement = document.createElement("div");
                    resultElement.className = "result";
                    (function (id) {
                        resultElement.onclick = function () {
                            showItemDetails(id);
                        }
                    })(currentItemData.id)

                    var headerContainer = document.createElement("div");
                    headerContainer.classList.add("headerContainer");
                    var subheaderContainer = document.createElement("div");
                    subheaderContainer.classList.add("subheaderContainer");

                    var name = document.createElement("h3");
                    name.classList.add("name");
                    name.textContent = currentItemData.name;

                    var type = document.createElement("p");
                    type.classList.add("type");
                    type.textContent = currentItemData.type;

                    var park = document.createElement("p");
                    park.classList.add("park");
                    park.textContent = currentItemData.park;

                    var author = document.createElement("p");
                    author.classList.add("author");
                    author.textContent = currentItemData.author;

                    headerContainer.appendChild(name);
                    headerContainer.appendChild(type);

                    subheaderContainer.appendChild(park);
                    subheaderContainer.appendChild(author);

                    resultElement.appendChild(headerContainer);
                    resultElement.appendChild(subheaderContainer);
                    document.querySelector(".resultsContainer").appendChild(resultElement);
                }
            }
        }, (error) => {
            var errorMessageElement = document.createElement("p");
            errorMessageElement.className = "message";
            errorMessageElement.textContent = "Something went wrong.";
            document.querySelector(".resultsContainer").appendChild(errorMessageElement);
        }
    });
    
}

function search(query) {
    
    
    
}

var searchBar = {
    onfocus: function () {
        document.querySelector("header").classList.add("searchActive");
    },
    onblur: function () {
        document.querySelector("header").classList.remove("searchActive");
    }
};