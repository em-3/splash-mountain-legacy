function updateSearchResults() {
    
    
    
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

async function fetch(path) {
    
    var promise = new Promise(function (arg) {
        return arg;
    })
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            promise.resolve(this.responseText);
        }
    }
    request.open("GET", path);
    
    return promise;
    
}