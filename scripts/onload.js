function checkIframeLoadStatus() {
    var contentWindow = document.querySelector(".databaseBrowser .iframeContainer iframe").contentDocument || document.querySelector(".databaseBrowser .iframeContainer iframe").contentWindow.document;
    if (contentWindow.readyState === "complete") {
        showDatabaseBrowser();
    } else {
        setTimeout(checkIframeLoadStatus, 100);
    }
}

function showDatabaseBrowser() {
    document.querySelector(".databaseBrowser .loadingScreen").classList.add("hidden");
    document.querySelector(".databaseBrowser .iframeContainer").classList.remove("hidden");
}

checkIframeLoadStatus();