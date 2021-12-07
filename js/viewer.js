//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var id = params.get("id");
var embedded = params.get("embedded");

function fetch(id) {
    return new Promise(function(resolve, reject) {
        resolve(JSON.stringify({
            id: "anw71nJwfg19A",
            park: "WDW",
            name: "Splash Mountain at Night",
            author: "MartinVidsDotNet",
            date: "11/2/21",
            type: "Image",
            format: "image/png",
            description: "Splash Mountain as seen at night."
        }))
    });
}

var loadedItemDetails;
var timeOutHasExpired = false;

//Fetch the item details and content
if (id) {
    //Start a timeout
    setTimeout(function () {
        timeOutHasExpired = true;
        if (loadedItemDetails) {
            showItemDetails();
        }
    }, 1000);
    fetch("/api/item/" + id + "/details").then(checkTimeout, showErrorScreen);
} else {
    showErrorScreen();
}

function checkTimeout(itemDetails) {
    loadedItemDetails = itemDetails;
    if (timeOutHasExpired) {
        showItemDetails()
    }
}

function showItemDetails() {
    var itemDetails = JSON.parse(loadedItemDetails);

    //Show the item details
    document.querySelector(".park").textContent = itemDetails.park;
    document.querySelector(".name").textContent = itemDetails.name;
    document.querySelector(".description").textContent = itemDetails.description;
    var properties = ["author", "date", "type", "format"];
    for (var i in properties) {
        var element = document.createElement("p");
        element.classList.add("property");
        element.textContent = properties[i][0].toUpperCase() + properties[i].slice(1) + ": ";
        var span = document.createElement("span");
        span.textContent = itemDetails[properties[i]];
        element.appendChild(span);
        document.querySelector(".itemInfoContainer").appendChild(element);
    }

    document.querySelector(".contentType").textContent = itemDetails.type;


    requestAnimationFrame(function () {
        document.querySelector("header").classList.remove("hidden");
        document.querySelector(".itemInfoContainer").classList.remove("hidden");
    });

    //Show the item content
    showItemContent(id, itemDetails.type, itemDetails.format);

}

function showItemContent(id, itemType, itemFormat) {
    //Show the item content
    switch (itemType) {
        case "Image":
            var contentDisplayElement = document.createElement("img");
            // contentDisplayElement.src = "/api/" + id;
            contentDisplayElement.src = "TEST.png";
            break;
        case "Video":
            var contentDisplayElement = document.createElement("video");
            contentDisplayElement.src = "/api/" + id;
            break;
        case "Audio":
            var contentDisplayElement = document.createElement("audio");
            contentDisplayElement.src = "/api/" + id;
            break;
    }

    document.querySelector(".contentDisplay").appendChild(contentDisplayElement);

    document.querySelector(".loadingScreen").classList.add("hidden")
    document.querySelector(".contentDisplay").classList.remove("hidden");
    setTimeout(function () {
        document.querySelector(".contentDisplay").classList.remove("invisible");
    });
}

function showErrorScreen() {
    //Hide the loading screen and show the error screen
    document.querySelector(".loadingScreen").classList.add("hidden")
    document.querySelector(".errorScreen").classList.remove("hidden");
}

function closeItemDetails() {
    window.top.postMessage("closeDetails", "*");
}