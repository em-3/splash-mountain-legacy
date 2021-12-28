var quote = document.querySelector(".quote");
var subquote = document.querySelector(".subquote");
var description = document.querySelector(".description");
var link = document.querySelector(".link");

var options = [
    {
        quote: "He's headin' for a little bit of danger...",
        subquote: "Time to be turnin' around.",
        description: "You don't have permission to access this page.",
        link: "Head Back to Safety"
    },
    {
        quote: "Folks hereabouts say Br'er Rabbit's leavin' home.",
        subquote: "I say he's headin' for trouble.",
        description: "You don't have permission to access this page.",
        link: "Head Back to Safety"
    },
    {
        quote: "Stop jumpin' around!",
        subquote: "You'll run out of breath!",
        description: "You don't have permission to access this page.",
        link: "Head Back to Safety"
    }
]

var index = Math.floor(Math.random() * options.length);
var chosenOption = options[index];

quote.textContent = chosenOption.quote;
subquote.textContent = chosenOption.subquote;
description.textContent = chosenOption.description;
link.textContent = chosenOption.link;