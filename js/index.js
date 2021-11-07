//Listen for the Konami code
var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiCodeIndex = 0;

document.addEventListener("keydown", function(event) {
    if (event.keyCode === konamiCode[konamiCodeIndex]) {
        konamiCodeIndex++;
    } else {
        konamiCodeIndex = 0;
    }

    if (konamiCodeIndex === konamiCode.length) {
        //Redirect the page to a rickroll
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
});