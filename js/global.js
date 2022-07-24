function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

var dialog = {
	isClearing: false,
	callbacks: {
		dismiss: function () {
			dialog.isClearing = true;
			document.querySelector(".overlay").classList.add("hidden");
			var dialogElement = document.querySelector(".dialog");
			dialogElement.classList.add("hidden");
			setTimeout(function () {
				dialogElement.parentElement.removeChild(dialogElement);
				dialog.isClearing = false;
			}, 200);
		},
	},
	confirm: function (title, message, options) {
		return this.displayDialog("confirm", title, message, options);
	},
	prompt: function (title, message, options) {
		return this.displayDialog("prompt", title, message, options);
	},
	alert: function (title, message, options) {
		return this.displayDialog("alert", title, message, options);
	},
	displayDialog: async function (type, title, message, options) {
		return new Promise(function (resolve, reject) {
			if (dialog.isClearing) {
				wait(200).then(function () {
					dialog
						.displayDialog(type, title, message, options)
						.then(resolve, reject);
				});
				return;
			}

			var dialogElement = document.createElement("div");
			dialogElement.classList.add("dialog");
			dialogElement.classList.add("hidden");
			dialogElement.innerHTML = `
                <h1 class="title">${title}</h1>
                <p class="message">${message}</p>
            `;

			if (type === "prompt") {
				var input = document.createElement("input");
				input.type = "text";
				if (options.placeholder) {
					input.placeholder = options.placeholder;
				}
				input.className = "input";
				dialogElement.appendChild(input);
			}

			var buttonContainer = document.createElement("div");
			buttonContainer.className = "buttonContainer";
			dialogElement.appendChild(buttonContainer);

			if (type !== "alert") {
				if (options && options.cancellable) {
					buttonContainer.appendChild(
						dialog.createButton("Cancel", "passive", function () {
							dialog.callbacks.dismiss();
							reject();
						})
					);
				}
			}

			switch (type) {
				case "alert":
					buttonContainer.appendChild(
						dialog.createButton("Done", "primary", function () {
							dialog.callbacks.dismiss();
							resolve();
						})
					);
					break;
				case "confirm":
					for (var i = 0; i < options.buttons.length; i++) {
						(function (i) {
							buttonContainer.appendChild(
								dialog.createButton(
									options.buttons[i].text,
									options.buttons[i].type,
									function () {
										dialog.callbacks.dismiss();
										resolve(i);
									}
								)
							);
						})(i);
					}
					break;
				case "prompt":
					buttonContainer.appendChild(
						dialog.createButton("Done", "active", function () {
							dialog.callbacks.dismiss();
							resolve(input.value);
						})
					);
					break;
			}

			document.body.insertBefore(
				dialogElement,
				document.querySelector(".overlay")
			);
			requestAnimationFrame(function () {
				document.querySelector(".overlay").classList.remove("hidden");
				document.querySelector(".dialog").classList.remove("hidden");
			});
		});
	},
	createButton: function (text, type, callback) {
		var button = document.createElement("button");
		button.textContent = text;
		button.classList.add(type);
		button.addEventListener("click", callback);
		return button;
	},
};

dialog
	.prompt("Test Prompt", "This is a test prompt.", {
		placeholder: "Placeholder",
	})
	.then(function (inputValue) {
		dialog.alert("Test Alert", inputValue).then(function () {
			dialog
				.confirm("Test Confirm", "This is a test confirm.", {
					cancellable: true,
					buttons: [
						{ text: "Yes", type: "active" },
						{ text: "No", type: "passive" },
						{ text: "Burn it", type: "destructive" },
					],
				})
				.then(function (name) {
					dialog.alert("Test Alert", "Button " + name);
				});
		});
	});
