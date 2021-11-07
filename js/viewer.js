//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var hash = params.get("hash");
var embedded = params.get("embedded");

function fetch(hash) {
    return new Promise(function(resolve, reject) {
        resolve(JSON.stringify({
            hash: "anw71nJwfg19A",
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

//Fetch the item details and content
if (hash) {
    fetch("/api/item/" + hash + "/details").then(showItemDetails, showErrorScreen);
} else {
    showErrorScreen();
}

function showItemDetails(itemDetails) {
    itemDetails = JSON.parse(itemDetails);

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
    showItemContent(hash, itemDetails.type, itemDetails.format);

}

function showItemContent(hash, itemType, itemFormat) {
    //Show the item content
    switch (itemType) {
        case "Image":
            var contentDisplayElement = document.createElement("img");
            // contentDisplayElement.src = "/api/" + hash;
            contentDisplayElement.src = "TEST.png";
            break;
        case "Video":
            var contentDisplayElement = document.createElement("video");
            contentDisplayElement.src = "/api/" + hash;
            break;
        case "Audio":
            var contentDisplayElement = document.createElement("audio");
            contentDisplayElement.src = "/api/" + hash;
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