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
            select.name = "park";
            select.id = "park";

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

            select.value = itemDetails.park.toLowerCase();

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
            input.value = itemDetails.name;
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
            input.value = itemDetails.description;
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
            container.classList.add("propertyContainer");

            var nameLabel = document.createElement("label");
            nameLabel.for = "authorName";
            nameLabel.textContent = "Author Name";
            var nameInput = document.createElement("input");
            nameInput.name = "authorName";
            nameInput.id = "authorName";
            //Remove anything between square brackets from author name
            if (itemDetails.author) { nameInput.value = itemDetails.author.replace(/\[.*\]/, ""); }
            container.appendChild(nameLabel);
            container.appendChild(nameInput);

            var linkLabel = document.createElement("label");
            linkLabel.for = "authorLink";
            linkLabel.textContent = "Author Link";
            var linkInput = document.createElement("input");
            linkInput.name = "authorLink";
            linkInput.id = "authorLink";
            //Get the portion of the author link between square brackets
            if (itemDetails.author) { linkInput.value = itemDetails.author.match(/\[(.*)\]/) }
            container.appendChild(linkLabel);
            container.appendChild(linkInput);

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
            if (itemDetails.timestamp) {
                dateInput.value = itemDetails.timestamp.split(" ")[0];
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
            if (itemDetails.timestamp && (itemDetails.timestamp.indexOf(" ") !== -1)) {
                timeInput.value = itemDetails.timestamp.split(" ")[1];
            }
            timestampContainer.appendChild(timeInput);

            var precisionLabel = document.createElement("label");
            precisionLabel.for = "timestampPrecision";
            precisionLabel.textContent = "Timestamp Precision";
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
            if (metadata.precision) { precisionSelect.value = metadata.precision };
            timestampContainer.appendChild(precisionSelect);

            container.appendChild(timestampContainer);

            //Hardware Info
            var hardwareInfoContainer = document.createElement("div");
            hardwareInfoContainer.classList.add("propertyContainer");

            //Make
            var makeLabel = document.createElement("label");
            makeLabel.for = "make";
            makeLabel.textContent = "Recording Device Make";
            hardwareInfoContainer.appendChild(makeLabel);

            var makeInput = document.createElement("input");
            makeInput.name = "make";
            makeInput.id = "make";
            if (metadata.make) { makeInput.value = metadata.make };
            hardwareInfoContainer.appendChild(makeInput);

            //Model
            var modelLabel = document.createElement("label");
            modelLabel.for = "model";
            modelLabel.textContent = "Recording Device Model";
            hardwareInfoContainer.appendChild(modelLabel);

            var modelInput = document.createElement("input");
            modelInput.name = "model";
            modelInput.id = "model";
            if (metadata.model) { modelInput.value = metadata.model };
            hardwareInfoContainer.appendChild(modelInput);

            container.appendChild(hardwareInfoContainer);

            if (type === "image" || type === "video") {
                var cameraInfoContainer = document.createElement("div");
                cameraInfoContainer.classList.add("propertyContainer");

                //Focal Length
                var focalLengthLabel = document.createElement("label");
                focalLengthLabel.for = "focalLength";
                focalLengthLabel.textContent = "Focal Length";
                cameraInfoContainer.appendChild(focalLengthLabel);

                var focalLengthInput = document.createElement("input");
                focalLengthInput.name = "focalLength";
                focalLengthInput.id = "focalLength";
                focalLengthInput.placeholder = "20.1";
                if (metadata.focalLength) { focalLengthInput.value = metadata.focalLength };
                cameraInfoContainer.appendChild(focalLengthInput);

                //Software Version
                var softwareVersionLabel = document.createElement("label");
                softwareVersionLabel.for = "softwareVersion";
                softwareVersionLabel.textContent = "Software Version";
                cameraInfoContainer.appendChild(softwareVersionLabel);

                var softwareVersionInput = document.createElement("input");
                softwareVersionInput.name = "softwareVersion";
                softwareVersionInput.id = "softwareVersion";
                softwareVersionInput.placeholder = "15.0";
                if (metadata.software) { softwareVersionInput.value = metadata.software };
                cameraInfoContainer.appendChild(softwareVersionInput);

                //Exposure Time
                var exposureTimeLabel = document.createElement("label");
                exposureTimeLabel.for = "exposureTime";
                exposureTimeLabel.textContent = "Exposure Time";
                cameraInfoContainer.appendChild(exposureTimeLabel);

                var exposureTimeInput = document.createElement("input");
                exposureTimeInput.name = "exposureTime";
                exposureTimeInput.id = "exposureTime";
                exposureTimeInput.placeholder = "1/50";
                if (metadata.exposureTime) { exposureTimeInput.value = metadata.exposureTime };
                cameraInfoContainer.appendChild(exposureTimeInput);

                //F-number
                var fNumberLabel = document.createElement("label");
                fNumberLabel.for = "fNumber";
                fNumberLabel.textContent = "F-number";
                cameraInfoContainer.appendChild(fNumberLabel);

                var fNumberInput = document.createElement("input");
                fNumberInput.name = "fNumber";
                fNumberInput.id = "fNumber";
                fNumberInput.placeholder = "4.0";
                if (metadata.fNumber) { fNumberInput.value = metadata.fNumber };
                cameraInfoContainer.appendChild(fNumberInput);

                //Flash
                var flashLabel = document.createElement("label");
                flashLabel.for = "flash";
                flashLabel.textContent = "Flash";
                cameraInfoContainer.appendChild(flashLabel);

                var flashInput = document.createElement("input");
                flashInput.name = "flash";
                flashInput.id = "flash";
                flashInput.placeholder = "Flash did not fire, compulsory flash mode";
                if (metadata.flash) { flashInput.value = metadata.flash };
                cameraInfoContainer.appendChild(flashInput);

                //Color Space
                var colorSpaceLabel = document.createElement("label");
                colorSpaceLabel.for = "colorSpace";
                colorSpaceLabel.textContent = "Color Space";
                cameraInfoContainer.appendChild(colorSpaceLabel);

                var colorSpaceInput = document.createElement("input");
                colorSpaceInput.name = "colorSpace";
                colorSpaceInput.id = "colorSpace";
                colorSpaceInput.placeholder = "sRGB";
                if (metadata.colorSpace) { colorSpaceInput.value = metadata.colorSpace };
                cameraInfoContainer.appendChild(colorSpaceInput);

                container.appendChild(cameraInfoContainer);
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
            var elements = {};
            elements.timestampPrecision = document.getElementById("timestampPrecision");
            elements.make = document.getElementById("make");
            elements.model = document.getElementById("model");
            elements.focalLength = document.getElementById("focalLength");
            elements.softwareVersion = document.getElementById("softwareVersion");
            elements.exposureTime = document.getElementById("exposureTime");
            elements.fNumber = document.getElementById("fNumber");
            elements.flash = document.getElementById("flash");
            elements.colorSpace = document.getElementById("colorSpace");
            elements.samplingRate = document.getElementById("samplingRate");

            if (elements.timestampPrecision && elements.timestampPrecision.value) { updatedMetadata.precision = elements.timestampPrecision.value };
            if (elements.make && elements.make.value) { updatedMetadata.make = elements.make.value };
            if (elements.model && elements.model.value) { updatedMetadata.model = elements.model.value };
            if (elements.focalLength && elements.focalLength.value) { updatedMetadata.focalLength = elements.focalLength.value };
            if (elements.softwareVersion && elements.softwareVersion.value) { updatedMetadata.software = elements.softwareVersion.value };
            if (elements.exposureTime && elements.exposureTime.value) { updatedMetadata.exposureTime = elements.exposureTime.value };
            if (elements.fNumber && elements.fNumber.value) { updatedMetadata.fNumber = elements.fNumber.value };
            if (elements.flash && elements.flash.value) { updatedMetadata.flash = elements.flash.value };
            if (elements.colorSpace && elements.colorSpace.value) { updatedMetadata.colorSpace = elements.colorSpace.value };
            if (elements.samplingRate && elements.samplingRate.value) { updatedMetadata.samplingRate = elements.samplingRate.value };

            return {
                include: true,
                value: JSON.stringify(updatedMetadata)
            }
        }
    });

    //Show the item details
    for (var i = 0; i < properties.length; i++) {
        var currentProperty = properties[i];
        document.querySelector(".editor .properties").appendChild(currentProperty.constructor());
    }

    var thumbnailElement = undefined;
    switch (type) {
        case "image":
            thumbnailElement = document.querySelector(".thumbnail img");
            thumbnailElement.src = "/resources/" + id + "/thumbnail";
            break;
        case "video":
        case "audio":
            thumbnailElement = document.querySelector(".thumbnail iframe");
            thumbnailElement.src = "https://www.youtube.com/embed/" + itemDetails.video_id;
            break;
    }
    thumbnailElement.classList.remove("hidden");

    document.querySelector(".itemID").textContent = id;
    document.querySelector(".itemType").textContent = type;
    document.querySelector(".itemName").textContent = itemDetails.name;

    document.querySelector(".loadingContainer").classList.add("hidden");
    requestAnimationFrame(function () {
        document.querySelector(".editor").classList.remove("hidden");
    });

}

async function updateItem() {
    document.querySelector(".editor").classList.add("hidden");
    document.querySelector(".progressContainer").classList.remove("hidden");

    var formData = new FormData();

    formData.append("id", id);

    for (var i = 0; i < properties.length; i++) {
        var currentProperty = properties[i];
        var currentPropertyValue = currentProperty.valueGetter();
        if (currentPropertyValue.include) {
            formData.append(currentProperty.propertyName, currentPropertyValue.value);
        } else if (currentPropertyValue.fail) {
            document.querySelector(".editor .errorMessage").classList.remove("hidden");
            document.querySelector(".editor .errorMessage").textContent = "Please fill out all required fields.";
            document.querySelector(".progressContainer").classList.add("hidden");
            document.querySelector(".editor").classList.remove("hidden");
            return;
        }
    }

    var date = document.querySelector(".editor #date").value;
    var time = document.querySelector(".editor #time").value;
    if (date && time) {
        formData.append("timestamp", date + " " + time);
    } else if (date) {
        formData.append("timestamp", date);
    }

    var response = await fetch('/admin/upload.php', {
        method: 'POST',
        body: formData
    });
    let result = await response.json();

    if (result.status === "success") {
        document.querySelector(".responseContainer .title").textContent = "Done.";
        document.querySelector(".responseContainer .subtitle").textContent = "The item has been updated.";
        document.querySelector(".responseContainer .message").textContent = "Item ID: " + result.id;
    } else {
        document.querySelector(".responseContainer .title").textContent = "Congratulations, you broke something.";
        document.querySelector(".responseContainer .subtitle").textContent = "Good going.";
        document.querySelector(".responseContainer .message").textContent = result.error;
    }

    document.querySelector(".progressContainer").classList.add("hidden");
    document.querySelector(".responseContainer").classList.remove("hidden");
}

async function deleteItem() {
    var formData = new FormData();

    formData.append("id", id);

    var response = await fetch('/admin/delete.php', {
        method: 'POST',
        body: formData
    });
    let result = await response.json();

    if (result.status === "success") {
        document.querySelector(".responseContainer .title").textContent = "Done.";
        document.querySelector(".responseContainer .subtitle").textContent = "The item has been removed from the database.";
        document.querySelector(".responseContainer .message").textContent = "";
    } else {
        document.querySelector(".responseContainer .title").textContent = "Congratulations, you broke something.";
        document.querySelector(".responseContainer .subtitle").textContent = "Good going.";
        document.querySelector(".responseContainer .message").textContent = result.error;
    }

    document.querySelector(".progressContainer").classList.add("hidden");
    document.querySelector(".responseContainer").classList.remove("hidden");
}

function showErrorScreen() {
    //Hide the loading screen and show the error screen
    document.querySelector(".loadingContainer").classList.add("hidden")
    document.querySelector(".errorContainer").classList.remove("hidden");
}

function closeEditor() {
    window.top.postMessage("closeEditor", "*");
}