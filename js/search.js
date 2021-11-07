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