function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

var dialog = {
	queue: [],
	isRendering: false,
	addToQueue: async function (type, title, message, options) {
		return new Promise(function (resolve, reject) {
			dialog.queue.push([type, title, message, options, resolve, reject]);

			if (!dialog.isRendering) {
				dialog.renderLoop();
				return;
			}
		});
	},
	renderLoop: function () {
		dialog.isRendering = true;
		var next = dialog.queue[0];
		if (next) {
			dialog.render(
				next[0], // Type
				next[1], // Title
				next[2], // Message
				next[3], // Options
				function (value) {
					//Run the dialog's resolve function
					next[4](value);
					//Continue the queue
					dialog.queue.shift();
					setTimeout(dialog.renderLoop, 200);
				},
				function (value) {
					//Run the dialog's reject function
					next[5](value);
					//Continue the queue
					dialog.queue.shift();
					setTimeout(dialog.renderLoop, 200);
				}
			);
		} else {
			dialog.isRendering = false;
		}
	},
	render: function (type, title, message, options, resolve, reject) {
		var dialogElement = document.createElement("div");
		dialogElement.classList.add("dialog");
		dialogElement.classList.add("hidden");
		dialogElement.innerHTML = `
            <h1 class="title">${title}</h1>
            <p class="message" lang="en">${message}</p>
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
							dialog.createButton(options.buttons[i].text, options.buttons[i].type, function () {
								dialog.callbacks.dismiss();
								resolve(i);
							})
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

		document.body.insertBefore(dialogElement, document.querySelector(".overlay"));
		requestAnimationFrame(function () {
			document.querySelector(".dialog").classList.remove("hidden");
		});
	},

	callbacks: {
		dismiss: function () {
			if (dialog.queue.length > 1) {
				document.querySelector(".overlay").classList.add("show");
			} else {
				document.querySelector(".overlay").classList.remove("show");
			}

			var dialogElement = document.querySelector(".dialog");
			dialogElement.classList.add("hidden");
			setTimeout(function () {
				dialogElement.parentElement.removeChild(dialogElement);
			}, 200);
		},
	},
	confirm: function (title, message, options) {
		return this.addToQueue("confirm", title, message, options);
	},
	prompt: function (title, message, options) {
		return this.addToQueue("prompt", title, message, options);
	},
	alert: function (title, message, options) {
		return this.addToQueue("alert", title, message, options);
	},
	createButton: function (text, type, callback) {
		var button = document.createElement("button");
		button.textContent = text;
		button.classList.add(type);
		button.addEventListener("click", callback);
		return button;
	},
};
