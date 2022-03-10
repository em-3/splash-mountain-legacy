//Parse PHP parameters from the URL
var url = new URL(window.location.href);
var params = url.searchParams;
var id = params.get("id");
var embedded = params.get("embedded");

var properties = [];

//Fetch the item details and content
if (id) {
    fetch("/api/item/" + id)
    .then(response => response.json())
    .then(showItemDetails, showErrorScreen);
} else {
    showErrorScreen();
}

function showItemDetails(itemDetails) {
    var type = itemDetails.type;
    var metadata = JSON.parse(itemDetails.metadata);

    //Park
    properties.push({
        name: "Park",
        propertyName: "park",
        constructor: function () {
            var container = document.createElement("div");
            container.classList.add("propertyContainer");
            container.classList.add("park");
            var label = document.createElement("label");
            label.for = "park";
            label.textContent = "Park";
            var select = document.createElement("select");
            input.name = "park";
            input.id = "park";

            var wdw = document.createElement("option");
            wdw.textContent = "WDW";
            wdw.value = "wdw";
            select.appendChild(wdw);
            var dl = document.createElement("option");
            dl.textContent = "DL";
            dl.value = "dl";
            select.appendChild(dl);
            var tdl = document.createElement("option");
            tdl.textContent = "TDL";
            tdl.value = "tdl";
            select.appendChild(tdl);

            select.value = metadata.park.toLowerCase();

            container.appendChild(label);
            container.appendChild(select);
            return container;
        },
        valueGetter: function () {
            var value = document.querySelector("#park").value.toUpperCase();
            if (value) {
                return {
                    include: true,
                    value: value
                }
            } else {
                return {
                    include: false,
                    fail: true
                }
            }
        }
    });
    //Name
    properties.push({
        name: "Name",
        propertyName: "name",
        constructor: function () {
            var container = document.createElement("div");
            container.classList.add("propertyContainer");
            container.classList.add("name");
            var label = document.createElement("label");
            label.for = "name";
            label.textContent = "Name";
            var input = document.createElement("input");
            input.name = "name";
            input.id = "name";
            input.value = metadata.name;
            container.appendChild(label);
            container.appendChild(input);
            return container;
        },
        valueGetter: function () {
            var value = document.querySelector("#name").value;
            if (value) {
                return {
                    include: true,
                    value: value
                }
            } else {
                return {
                    include: false,
                    fail: true
                }
            }
        }
    });
    //Description
    properties.push({
        name: "Description",
        propertyName: "description",
        constructor: function () {
            var container = document.createElement("div");
            container.classList.add("propertyContainer");
            container.classList.add("description");
            var label = document.createElement("label");
            label.for = "description";
            label.textContent = "Description";
            var input = document.createElement("textarea");
            input.name = "description";
            input.id = "description";
            input.value = metadata.description;
            container.appendChild(label);
            container.appendChild(input);
            return container;
        },
        valueGetter: function () {
            var value = document.querySelector("#description").value;
            if (value) {
                return {
                    include: true,
                    value: value
                }
            } else {
                return {
                    include: false,
                    fail: true
                }
            }
        }
    });
    //Author
    properties.push({
        name: "Author",
        propertyName: "author",
        constructor: function () {
            var container = document.createElement("div");

            var nameContainer = document.createElement("div");
            nameContainer.classList.add("propertyContainer");
            nameContainer.classList.add("authorLink");
            var nameLabel = document.createElement("label");
            nameLabel.for = "authorLink";
            nameLabel.textContent = "Author Link";
            var nameInput = document.createElement("input");
            nameInput.name = "authorLink";
            nameInput.id = "authorLink";
            //Remove anything between square brackets from author name
            if (metadata.author) { nameInput.value = metadata.author.replace(/\[.*\]/, ""); }
            nameContainer.appendChild(nameLabel);
            nameContainer.appendChild(nameInput);

            var linkContainer = document.createElement("div");
            linkContainer.classList.add("propertyContainer");
            linkContainer.classList.add("authorLink");
            var linkLabel = document.createElement("label");
            linkLabel.for = "authorLink";
            linkLabel.textContent = "Author Link";
            var linkInput = document.createElement("input");
            linkInput.name = "authorLink";
            linkInput.id = "authorLink";
            //Get the portion of the author link between square brackets
            if (metadata.author) { linkInput.value = metadata.author.match(/\[(.*)\]/) }
            linkContainer.appendChild(linkLabel);
            linkContainer.appendChild(linkInput);

            container.appendChild(nameContainer);
            container.appendChild(linkContainer);
            return container;
        },
        valueGetter: function () {
            var nameValue = document.querySelector("#authorName").value;
            var linkValue = document.querySelector("#authorLink").value;
            if (nameValue && linkValue) {
                return {
                    include: true,
                    value: nameValue + "[" + linkValue + "]"
                }
            } else if (nameValue) {
                return {
                    include: true,
                    value: nameValue
                }
            } else {
                return {
                    include: false,
                    fail: false
                }
            }
        }
    });
    //Metadata
    properties.push({
        name: "Metadata",
        propertyName: "metadata",
        constructor: function () {
            var container = document.createElement("div");

            //Timstamp
            var timestampContainer = document.createElement("div");
            timestampContainer.classList.add("propertyContainer");
            timestampContainer.classList.add("timestamp");

            var dateLabel = document.createElement("label");
            dateLabel.for = "date";
            dateLabel.textContent = "Date";
            timestampContainer.appendChild(dateLabel);
            var dateInput = document.createElement("input");
            dateInput.type = "date";
            dateInput.name = "date";
            dateInput.id = "date";
            if (metadata.timestamp) {
                dateInput.value = metadata.timestamp.split(" ")[0];
            }
            timestampContainer.appendChild(dateInput);

            var timeLabel = document.createElement("label");
            timeLabel.for = "time";
            timeLabel.textContent = "Time";
            timestampContainer.appendChild(timeLabel);
            var timeInput = document.createElement("input");
            timeInput.type = "time";
            timeInput.name = "time";
            timeInput.id = "time";
            if (metadata.timestamp && (metadata.timestamp.indexOf(" ") !== -1)) {
                dateInput.value = metadata.timestamp.split(" ")[1];
            }
            timestampContainer.appendChild(timeInput);

            var precisionLabel = document.createElement("label");
            precisionLabel.for = "timestampPrecision";
            precisionLabel.textContent = "Tiemstamp Precision";
            timestampContainer.appendChild(precisionLabel);
            var precisionSelect = document.createElement("select");
            precisionSelect.name = "timestampPrecision";
            precisionSelect.id = "timestampPrecision";
            var precisionOptions = ["year", "month", "day", "hour", "minute"];
            for (var i = 0; i < precisionOptions.length; i++) {
                var option = document.createElement("option");
                option.value = precisionOptions[i];
                option.textContent = precisionOptions[i][0].toUpperCase() + precisionOptions[i].slice(1);
                precisionSelect.appendChild(option);
            }
            if (metadata.timestampPrecision) { precisionSelect.value = metadata.timestampPrecision };
            timestampContainer.appendChild(precisionSelect);

            container.appendChild(timestampContainer);

            //Make
            var makeContainer = document.createElement("div");
            makeContainer.classList.add("propertyContainer");
            makeContainer.classList.add("make");

            var makeLabel = document.createElement("label");
            makeLabel.for = "make";
            makeLabel.textContent = "Recording Device Make";
            makeContainer.appendChild(makeLabel);

            var makeInput = document.createElement("input");
            makeInput.name = "make";
            makeInput.id = "make";
            if (metadata.make) { makeInput.value = metadata.make };
            makeContainer.appendChild(makeInput);

            container.appendChild(makeContainer);

            //Model
            var modelContainer = document.createElement("div");
            modelContainer.classList.add("propertyContainer");
            modelContainer.classList.add("model");

            var modelLabel = document.createElement("label");
            modelLabel.for = "model";
            modelLabel.textContent = "Recording Device Model";
            modelContainer.appendChild(modelLabel);

            var modelInput = document.createElement("input");
            modelInput.name = "model";
            modelInput.id = "model";
            if (metadata.model) { modelInput.value = metadata.model };
            modelContainer.appendChild(modelInput);

            container.appendChild(modelContainer);

            if (type === "image" || type === "video") {
                //Focal Length
                var focalLengthContainer = document.createElement("div");
                focalLengthContainer.classList.add("propertyContainer");
                focalLengthContainer.classList.add("focalLength");

                var focalLengthLabel = document.createElement("label");
                focalLengthLabel.for = "focalLength";
                focalLengthLabel.textContent = "Focal Length";
                focalLengthContainer.appendChild(focalLengthLabel);

                var focalLengthInput = document.createElement("input");
                focalLengthInput.name = "focalLength";
                focalLengthInput.id = "focalLength";
                focalLengthInput.placeholder = "20.1";
                if (metadata.focalLength) { focalLengthInput.value = metadata.focalLength };
                focalLengthContainer.appendChild(focalLengthInput);

                container.appendChild(focalLengthContainer);

                //Software Version
                var softwareVersionContainer = document.createElement("div");
                softwareVersionContainer.classList.add("propertyContainer");
                softwareVersionContainer.classList.add("softwareVersion");

                var softwareVersionLabel = document.createElement("label");
                softwareVersionLabel.for = "softwareVersion";
                softwareVersionLabel.textContent = "Software Version";
                softwareVersionContainer.appendChild(softwareVersionLabel);

                var softwareVersionInput = document.createElement("input");
                softwareVersionInput.name = "softwareVersion";
                softwareVersionInput.id = "softwareVersion";
                softwareVersionInput.placeholder = "15.0";
                if (metadata.software) { softwareVersionInput.value = metadata.software };
                softwareVersionContainer.appendChild(softwareVersionInput);

                container.appendChild(softwareVersionContainer);

                //Exposure Time
                var exposureTimeContainer = document.createElement("div");
                exposureTimeContainer.classList.add("propertyContainer");
                exposureTimeContainer.classList.add("exposureTime");

                var exposureTimeLabel = document.createElement("label");
                exposureTimeLabel.for = "exposureTime";
                exposureTimeLabel.textContent = "Exposure Time";
                exposureTimeContainer.appendChild(exposureTimeLabel);

                var exposureTimeInput = document.createElement("input");
                exposureTimeInput.name = "exposureTime";
                exposureTimeInput.id = "exposureTime";
                exposureTimeInput.placeholder = "1/50";
                if (metadata.exposureTime) { exposureTimeInput.value = metadata.exposureTime };
                exposureTimeContainer.appendChild(exposureTimeInput);

                container.appendChild(exposureTimeContainer);

                //F-number
                var fNumberContainer = document.createElement("div");
                fNumberContainer.classList.add("propertyContainer");
                fNumberContainer.classList.add("fNumber");

                var fNumberLabel = document.createElement("label");
                fNumberLabel.for = "fNumber";
                fNumberLabel.textContent = "F-number";
                fNumberContainer.appendChild(fNumberLabel);

                var fNumberInput = document.createElement("input");
                fNumberInput.name = "fNumber";
                fNumberInput.id = "fNumber";
                fNumberInput.placeholder = "4.0";
                if (metadata.fNumber) { fNumberInput.value = metadata.fNumber };
                fNumberContainer.appendChild(fNumberInput);

                container.appendChild(fNumberContainer);

                //Flash
                var flashContainer = document.createElement("div");
                flashContainer.classList.add("propertyContainer");
                flashContainer.classList.add("flash");

                var flashLabel = document.createElement("label");
                flashLabel.for = "flash";
                flashLabel.textContent = "Flash";
                flashContainer.appendChild(flashLabel);

                var flashInput = document.createElement("input");
                flashInput.name = "flash";
                flashInput.id = "flash";
                flashInput.placeholder = "Flash did not fire, compulsory flash mode";
                if (metadata.flash) { flashInput.value = metadata.flash };
                flashContainer.appendChild(flashInput);

                container.appendChild(flashContainer);

                //Color Space
                var colorSpaceContainer = document.createElement("div");
                colorSpaceContainer.classList.add("propertyContainer");
                colorSpaceContainer.classList.add("colorSpace");

                var colorSpaceLabel = document.createElement("label");
                colorSpaceLabel.for = "colorSpace";
                colorSpaceLabel.textContent = "Color Space";
                colorSpaceContainer.appendChild(colorSpaceLabel);

                var colorSpaceInput = document.createElement("input");
                colorSpaceInput.name = "colorSpace";
                colorSpaceInput.id = "colorSpace";
                colorSpaceInput.placeholder = "sRGB";
                if (metadata.colorSpace) { colorSpaceInput.value = metadata.colorSpace };
                colorSpaceContainer.appendChild(colorSpaceInput);

                container.appendChild(colorSpaceContainer);
            }

            if (type === "video" || type === "audio") {
                //Sampling Rate
                var samplingRateContainer = document.createElement("div");
                samplingRateContainer.classList.add("propertyContainer");
                samplingRateContainer.classList.add("samplingRate");

                var samplingRateLabel = document.createElement("label");
                samplingRateLabel.for = "samplingRate";
                samplingRateLabel.textContent = "Microphone Sampling Rate";
                samplingRateContainer.appendChild(samplingRateLabel);

                var samplingRateInput = document.createElement("input");
                samplingRateInput.name = "samplingRate";
                samplingRateInput.id = "samplingRate";
                samplingRateInput.placeholder = "196.33 kbit/s";
                if (metadata.samplingRate) { samplingRateInput.value = metadata.samplingRate };
                samplingRateContainer.appendChild(samplingRateInput);

                container.appendChild(samplingRateContainer);
            }

            return container;
        },
        valueGetter: function () {
            var updatedMetadata = {};
            var values = {};
            values.date = document.getElementById("date").value;
            values.time = document.getElementById("time").value;
            values.timestampPrecision = document.getElementById("timestampPrecision").value;
            values.make = document.getElementById("make").value;
            values.model = document.getElementById("model").value;
            values.focalLength = document.getElementById("focalLength").value;
            values.softwareVersion = document.getElementById("softwareVersion").value;
            values.exposureTime = document.getElementById("exposureTime").value;
            values.fNumber = document.getElementById("fNumber").value;
            values.flash = document.getElementById("flash").value;
            values.colorSpace = document.getElementById("colorSpace").value;
            values.samplingRate = document.getElementById("samplingRate").value;

            if (values.date && values.time) {
                values.timestamp = values.date + " " + values.time;
            } else if (date) {
                values.timestamp = values.date;
            }
        }
    });

    //Show the item details
    for (var i = 0; i < properties.length; i++) {
        var currentProperty = properties[i];
        document.querySelector(".editor .properties").appendChild(currentProperty.constructor());
    }

    document.querySelector(".thumbnail").src = "/resources/" + id + "/thumbnail";
    document.querySelector(".itemID").textContent = id;
    document.querySelector(".itemType").textContent = type;

    requestAnimationFrame(function () {
        document.querySelector(".itemInfoContainer").classList.remove("hidden");
    });

    //Show the item content
    showItemContent(id, itemDetails.type, itemDetails.format);

}

function showErrorScreen() {
    //Hide the loading screen and show the error screen
    document.querySelector(".loadingScreen").classList.add("hidden")
    document.querySelector(".errorScreen").classList.remove("hidden");
}

function closeEditor() {
    window.top.postMessage("closeEditor", "*");
}