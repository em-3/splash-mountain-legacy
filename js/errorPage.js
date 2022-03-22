var quote = document.querySelector(".quote");
var subquote = document.querySelector(".subquote");
var description = document.querySelector(".description");
var link = document.querySelector(".link");

var index = Math.floor(Math.random() * options.length);
var chosenOption = options[index];

quote.textContent = chosenOption.quote;
subquote.textContent = chosenOption.subquote;
description.textContent = chosenOption.description;
link.textContent = chosenOption.link;