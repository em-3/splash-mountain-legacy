var currentTimestamp;
var launchTimestamp = new Date("2022-07-17T20:00:00Z");

var container = document.querySelector("section");
var title = document.querySelector(".title");
var subtitle = document.querySelector(".subtitle");
var countdown = document.querySelector(".description");

function updateCountdown() {
	currentTimestamp = new Date();
	var difference = launchTimestamp.getTime() - currentTimestamp.getTime();

	//If the launch timestamp is in the past, redirect to index.html.
	if (difference <= 0) {
		window.location.href = "/";
	} else {
		var countdownString = "";

		var days = Math.floor(difference / (1000 * 60 * 60 * 24));
		var hours = Math.floor(
			(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((difference % (1000 * 60)) / 1000);

		if (days > 0) {
			countdownString += days + (days === 1 ? " day, " : " days, ");
		}
		if (hours > 0) {
			countdownString += hours + (hours === 1 ? " hour, " : " hours, ");
		}
		countdownString +=
			minutes + (minutes === 1 ? " minute, " : " minutes, ");
		countdownString += seconds + (seconds === 1 ? " second." : " seconds.");

		countdown.textContent = countdownString;
	}

	if (difference < 60 * 1000) {
		// within a minute
		container.classList.add("finalCountdown");
		title.textContent = Math.ceil(difference / 1000);
	} else if (difference < 10 * 60 * 1000) {
		// within 10 minutes
		title.textContent = "We're almost there!";
		subtitle.textContent =
			"Splash Mountain Legacy's official launch is just minutes away!";
	} else if (difference < 60 * 60 * 1000) {
		// within an hour
		title.textContent = "It's almost time!";
		subtitle.textContent =
			"Splash Mountain Legacy is about to open its doors to Splash fans worldwide.";
	} else if (difference < 24 * 60 * 60 * 1000) {
		// within a day
		title.textContent = "It's not quite time yet!";
		subtitle.textContent = "We're getting the site ready for launch!";
	} else if (difference < 7 * 24 * 60 * 60 * 1000) {
		// within a week
		title.textContent = "You're early!";
		subtitle.textContent = "Splash Mountain Legacy is coming soon!";
	}
}

updateCountdown();
setInterval(updateCountdown, 1000);
