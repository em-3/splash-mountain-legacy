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
            <p class="message">${message}</p>
        `;

		if (type === "list") {
			var listContainer = document.createElement("div");
			listContainer.className = "listContainer";

			var searchBar = document.createElement("input");
			searchBar.type = "text";
			searchBar.placeholder = "Filter...";
			searchBar.className = "searchBar";
			searchBar.oninput = function () {
				var items = listContainer.querySelectorAll(".item");
				for (var i = 0; i < items.length; i++) {
					if (
						items[i].children[0].textContent.toLowerCase().includes(searchBar.value.toLowerCase()) ||
						(
							items[i].children[1] &&
							items[i].children[1].textContent.toLowerCase().includes(searchBar.value.toLowerCase())
						)
					) {
						items[i].classList.remove("hidden");
					} else {
						items[i].classList.add("hidden");
					}
				}
			};
			listContainer.appendChild(searchBar);

			var list = document.createElement("div");
			list.className = "list";
			listContainer.appendChild(list);

			for (var i = 0; i < options.content.length; i++) {
				(function (i) {
					var item = document.createElement("div");
					item.classList.add("item");
					if (options.preselectedIndexes && options.preselectedIndexes.includes(i)) {
						item.classList.add("selected");
					}
					if (options.allowMultiple) {
						item.addEventListener("click", function () {
							item.classList.toggle("selected");
						});
					} else {
						item.addEventListener("click", function () {
							dialog.callbacks.dismiss();
							resolve({
								type: "listSelection",
								index: i,
							});
						});
					}

					var label = document.createElement("p");
					label.className = "label";
					label.textContent = options.content[i].label;
					item.appendChild(label);

					if (options.content[i].sublabel) {
						var sublabel = document.createElement("p");
						sublabel.className = "sublabel";
						sublabel.textContent = options.content[i].sublabel;
						item.appendChild(sublabel);
					}

					list.appendChild(item);
				})(i);
			}

			dialogElement.appendChild(listContainer);
		}

		if (type === "prompt") {
			if (options.placeholders) {
				//Create multiple inputs
				for (var i = 0; i < options.placeholders.length; i++) {
					var input = document.createElement("input");
					input.type = "text";
					input.placeholder = options.placeholders[i];
					input.className = "input";
					dialogElement.appendChild(input);
				}
			} else {
				//Create a single input
				var input = document.createElement("input");
				input.type = "text";
				if (options.placeholder) {
					input.placeholder = options.placeholder;
				}
				input.className = "input";
				dialogElement.appendChild(input);
			}
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
			case "list":
				if (!options.buttons || options.buttons.length === 0) {
					break;
				}
				for (var i = 0; i < options.buttons.length; i++) {
					(function (i) {
						buttonContainer.appendChild(
							dialog.createButton(options.buttons[i].text, options.buttons[i].type, function () {
								dialog.callbacks.dismiss();
								resolve({
									type: "buttonSelection",
									index: i,
								});
							})
						);
					})(i);
				}
				if (type === "list" && options.allowMultiple) {
					buttonContainer.appendChild(
						dialog.createButton("Done", "active", function () {
							dialog.callbacks.dismiss();
							var selectedItems = document.querySelectorAll(".dialog .item.selected");
							var indexes = [];
							for (var i = 0; i < selectedItems.length; i++) {
								indexes.push(Array.prototype.indexOf.call(selectedItems[i].parentNode.children, selectedItems[i]));
							}
							resolve({
								type: "listSelection",
								indexes: indexes,
							});
						})
					);
				}
				break;
			case "prompt":
				buttonContainer.appendChild(
					dialog.createButton("Done", "active", function () {
						dialog.callbacks.dismiss();
						var inputs = document.querySelectorAll(".dialog .input");
						var values = [];
						for (var i = 0; i < inputs.length; i++) {
							values.push(inputs[i].value);
						}
						resolve({
							type: "input",
							values: values,
						});
					})
				);
				break;
		}

		document.body.insertBefore(dialogElement, document.querySelector(".overlay"));
		requestAnimationFrame(function () {
			document.querySelector(".dialog").classList.remove("hidden");

			var inputs = document.querySelectorAll(".dialog input");
			if (inputs.length > 0) {
				inputs[0].focus();
			} else if (searchBar) {
				searchBar.focus();
			}
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
	list: function (title, message, content, options) {
		if (options) {
			options.content = content;
		} else {
			options = {
				content: content,
			};
		}
		return this.addToQueue("list", title, message, options);
	},
	createButton: function (text, type, callback) {
		var button = document.createElement("button");
		button.textContent = text;
		button.classList.add(type);
		button.addEventListener("click", callback);
		return button;
	},
};

var notification = {
	queue: [],
	isRendering: false,
	addToQueue: async function (type, icon, title, message, options) {
		return new Promise(function (resolve, reject) {
			notification.queue.push([type, icon, title, message, options, resolve, reject]);

			if (!notification.isRendering) {
				notification.renderLoop();
				return;
			}
		});
	},
	renderLoop: function () {
		notification.isRendering = true;
		var next = notification.queue[0];
		if (next) {
			notification.render(
				next[0], // Type
				next[1], // Icon
				next[2], // Title
				next[3], // Message
				next[4], // Options
				function (value) {
					//Run the notification's resolve function
					next[5](value);
					//Continue the queue
					notification.queue.shift();
					setTimeout(notification.renderLoop, 200);
				}
			);
		} else {
			notification.isRendering = false;
		}
	},
	render: function (type, icon, title, message, options, resolve, reject) {
		var notificationElement = document.createElement("div");
		notificationElement.classList.add("notification");
		notificationElement.classList.add("hidden");
		if (type) {
			notificationElement.classList.add(type);
		}
		notificationElement.innerHTML = `
			<div class="icon">
				<i class="gg-${icon}"></i>
			</div>
			<div class="content">
				<p class="title">${title}</p>
				<p class="message">${message}</p>
			</div>
		`;

		document.body.insertBefore(notificationElement, document.querySelector(".overlay"));
		requestAnimationFrame(function () {
			document.querySelector(".notification").classList.remove("hidden");
		});

		setTimeout(function () {
			notificationElement.classList.add("hidden");
			setTimeout(function () {
				notificationElement.parentElement.removeChild(notificationElement);
				resolve();
			}, 500);
		}, options?.duration || 3000);
	},

	show: function (type, icon, title, message, options) {
		return this.addToQueue(type, icon, title, message, options);
	}
};

var contextMenu = {
	present: function (options) {
		//Clear previous menu if present
		var previousMenu = document.querySelector(".contextMenu");
		if (previousMenu) {
			contextMenu.callbacks.dismiss();
		}

		var container = document.createElement("div");
		container.classList.add("contextMenu");
		container.classList.add("hidden");

		var items = options.items;
		for (var i = 0; i < items.length; i++) {
			var button = document.createElement("div");
			if (items[i].type) {
				button.classList.add(items[i].type);
			}
			if (items[i].disabled) {
				button.classList.add("disabled");
			}
			(function (i) {
				button.addEventListener("click", function () {
					items[i].callback();
					contextMenu.callbacks.dismiss();
				});
			})(i);

			var iconContainer = document.createElement("div");
			iconContainer.classList.add("icon");
			var icon = document.createElement("i");
			icon.classList.add("gg-" + items[i].icon);
			iconContainer.appendChild(icon);
			button.appendChild(iconContainer);

			var textContainer = document.createElement("p");
			textContainer.textContent = items[i].label;
			button.appendChild(textContainer);

			container.appendChild(button);
		}

		document.body.insertBefore(container, document.querySelector(".overlay"));

		//Calculate visible position of the context menu and adjust to fit on screen
		var x = options.x;
		var y = options.y;
		var width = container.offsetWidth;
		var height = container.offsetHeight;
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		if (x + width > windowWidth) {
			if (x - width > 0) {
				x -= width;
			} else {
				x = windowWidth - width - 10;
			}
		}
		if (y + height > windowHeight) {
			if (y - height > 0) {
				y -= height;
			} else {
				y = windowHeight - height - 10;
			}
		}
		container.style.left = x + "px";
		container.style.top = y + "px";

		requestAnimationFrame(function () {
			container.classList.remove("hidden");
			//Dismiss menu when clicking outside of it
			var dismiss = function (e) {
				if (e.target && e.target.closest && e.target.closest(".contextMenu")) {
					return;
				}
				container.classList.add("hidden");
				setTimeout(function () {
					if (container && container.parentElement) {
						container.parentElement.removeChild(container);
					}
				}, 200);
				document.removeEventListener("click", dismiss);
				window.removeEventListener("scroll", dismiss);
			}
			document.addEventListener("click", dismiss);
			window.addEventListener("scroll", dismiss);
		});
	},
	callbacks: {
		dismiss: function () {
			var menu = document.querySelector(".contextMenu");
			menu.classList.add("hidden");
			setTimeout(function () {
				if (menu && menu.parentElement) {
					menu.parentElement.removeChild(menu);
				}
			}, 200);
		}
	}
};