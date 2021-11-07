var filters = [];

function refreshResults () {
    var PHPParams = "";
    for (i in filters) {
        if (filters[i].value != "") {
            PHPParams += ((i === 0) ? "?" : "&") + filters[i].name + "=" + filters[i].value;
        }
    }

    //Clear the current results from .resultsContainer
        while (document.querySelector(".resultsContainer").firstChild) {
        document.querySelector(".resultsContainer").removeChild(document.querySelector(".resultsContainer").firstChild);
    }

    //Fetch new results
    fetch("/api/search" + PHPParams).then(function(response) {
        response.json().then((data) => {
            if (data.length === 0) {
                var noResults = document.createElement("p");
                noResults.className = "noResults";
                noResults.textContent = "No results found.";
                document.querySelector(".resultsContainer").appendChild(noResults);
            } else {
                for (i in data) {
                    var resultElement = document.createElement("div");
                    resultElement.className = "result";

                    var name = document.createElement("h3");
                    name.classList.add("name");
                    name.textContent = data[i].name;

                    resultElement.appendChild(name);
                    document.querySelector(".resultsContainer").appendChild(resultElement);
                }
            }

            //Hide the loading screen and show the database browser
            document.querySelector(".loadingScreen").classList.add("hidden");
            document.querySelector(".browser").classList.remove("hidden");
        });
    }, function(error) {
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