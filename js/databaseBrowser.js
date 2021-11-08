var filters = [];

function fetch() {
     return new Promise(function (resolve, reject) {
         resolve(JSON.stringify([
                {
                    name: "Splash Mountain at Night",
                    author: "91JLovesDisney",
                    type: "image"
                },
                {
                    name: "Brer Bear",
                    author: "91JLovesDisney",
                    type: "video"
                },
                {
                    name: "Test3",
                    author: "91JLovesDisney",
                    type: "image"
                },
                {
                    name: "Laughing Place",
                    author: "91JLovesDisney",
                    type: "audio"
                },
                {
                    name: "HDYD Instrumental",
                    author: "91JLovesDisney",
                    type: "audio"
                },
                {
                    name: "Brer Frog",
                    author: "91JLovesDisney",
                    type: "image"
                },
            ]));
     });
 }

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
    // fetch("/api/search" + PHPParams).then(response => response.json()).then((data) => {
    fetch("/api/search" + PHPParams).then(response => JSON.parse(response)).then((data) => {
        if (data.length === 0) {
            var noResults = document.createElement("p");
            noResults.className = "noResults";
            noResults.textContent = "No results found.";
            document.querySelector(".resultsContainer").appendChild(noResults);
        } else {
            for (i in data) {
                var currentItemData = data[i];

                var resultElement = document.createElement("div");
                resultElement.className = "result";

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
                author.textContent = currentItemData.author;

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