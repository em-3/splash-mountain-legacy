var quote = document.querySelector(".quote");
var subquote = document.querySelector(".subquote");
var description = document.querySelector(".description");
var link = document.querySelector(".link");

var options = [
    {
        quote: "So, you're lookin' for a Laughing Place, eh?",
        subquote: "We'll show you a Laughing Place...",
        description: "We couldn't find the page you're looking for.",
        link: "Head Back to Safety"
    },
    {
        quote: "Time to be turnin' around...",
        subquote: "If only you could.",
        description: "We couldn't find the page you're looking for.",
        link: "Head Back to Safety"
    },
    {
        quote: "If you've finally found your Laughing Place...",
        subquote: "How come you aren't laughing?",
        description: "We couldn't find the page you're looking for.",
        link: "Head Back to Safety"
    }
]

var index = Math.floor(Math.random() * options.length);
var chosenOption = options[index];

quote.textContent = chosenOption.quote;
subquote.textContent = chosenOption.subquote;
description.textContent = chosenOption.description;
link.textContent = chosenOption.link;