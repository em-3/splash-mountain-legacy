function navigateTo(sectionClass) {
    var sections = document.querySelectorAll("main > section");
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.add("hidden");
    }
    document.querySelector("main > ." + sectionClass).classList.remove("hidden");
}

document.querySelector("#file").onchange = function(e) {
    var file = e.target.files[0]
    if (file && file.name) {
        EXIF.getData(file, function() {
            var timecode = EXIF.getTag(this, "DateTime");
            if (timecode) {
                var dateTimeSplit = timecode.split(/\D/);
                var date = dateTimeSplit[0] + "-" + dateTimeSplit[1] + "-" + dateTimeSplit[2];
                var time = dateTimeSplit[3] + ":" + dateTimeSplit[4];
                document.querySelector("#date").value = date;
                document.querySelector("#time").value = time;
            }

            document.querySelector("#make").value = (EXIF.getTag(this, "Make") || "");
            document.querySelector("#model").value = (EXIF.getTag(this, "Model") || "");
            document.querySelector("#focalLength").value = (EXIF.getTag(this, "FocalLength") || "");
            document.querySelector("#software").value = (EXIF.getTag(this, "Software") || "");

            var exposureTime = EXIF.getTag(this, "ExposureTime");
            if (exposureTime) {
                document.querySelector("#exposureTime").value = (exposureTime.numerator + "/" + exposureTime.denominator);
            }

            document.querySelector("#fNumber").value = (EXIF.getTag(this, "FNumber") || "");
            document.querySelector("#flash").value = (EXIF.getTag(this, "Flash") || "");

            var colorSpace = EXIF.getTag(this, "ColorSpace");
            if (colorSpace) {
                switch (colorSpace) {
                    case 1:
                        document.querySelector("#colorSpace").value = "sRGB";
                        break;
                    case 2:
                        document.querySelector("#colorSpace").value = "Adobe RGB";
                        break;
                    case 3:
                        document.querySelector("#colorSpace").value = "Wide Gamut RGB";
                        break;
                    case 4:
                        document.querySelector("#colorSpace").value = "ICC Profile";
                        break;
                    case 65535:
                        document.querySelector("#colorSpace").value = "Uncalibrated";
                        break;
                }
            }

            document.querySelector("#samplingRate").value = (EXIF.getTag(this, "SamplingRate") || "");
        });
    }
}

function show(id, required) {
    var element = document.querySelector("#" + id);
    element.classList.remove("hidden");
    element.required = required;
    var label = document.querySelector("label[for=" + id + "]");
    if (label) {
        label.classList.remove("hidden");
    }
}

function hide(id) {
    var element = document.querySelector("#" + id);
    element.classList.add("hidden");
    element.required = false;
    var label = document.querySelector("label[for=" + id + "]");
    if (label) {
        label.classList.add("hidden");
    }
}

function updateItemType() {
    show("content", false);
    hide("file");
    hide("videoID");
    show("date", false);
    show("time", false);
    show("precision", true);
    hide("make");
    hide("model");
    hide("camera");
    hide("microphone")

    var selectedItemType = document.querySelector("#type").value;
    switch (selectedItemType) {
        case "image":
            show("file", true);
            show("date", true);
            show("time", true);
            show("precision", true);
            show("make", false);
            show("model", false);
            show("camera", false);
            break;
        case "video":
            show("camera", false);
        case "audio":
            show("content", false);
            show("videoID", true);
            show("make", false);
            show("model", false);
            show("microphone", false);
        case "date":
        case "text":
            hide("content");
            break;
    }
}

document.querySelector(".addItem .formContainer").addEventListener("input", function () {
    var requiredFields = document.querySelectorAll(".addItem *[required]");
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        var value = field.value;
        if (!value) {
            document.querySelector(".addItem .submitButton").disabled = true;
            return;
        }
    }
    document.querySelector(".addItem .submitButton").disabled = false;
});

document.querySelector(".removeItem .formContainer #itemID").addEventListener("input", function () {
    var itemID = this.value;
    document.querySelector(".removeItem .itemPreview").classList.add("hidden");
    if (itemID && itemID.length == 11) {
        //Show a preview of this item
        var response = fetch("/api/item/" + itemID).then(response => response.json())
        .then((response) => {
            if (response.type === "image") {
                document.querySelector(".removeItem .itemPreview .thumbnail").src = "/resources/" + itemID + "/thumbnail";
                document.querySelector(".removeItem .itemPreview .thumbnail").classList.remove("hidden");
            } else {
                document.querySelector(".removeItem .itemPreview .thumbnail").classList.add("hidden");
            }
            document.querySelector(".removeItem .itemPreview .park span").textContent = response.park;
            document.querySelector(".removeItem .itemPreview .name span").textContent = response.name;
            document.querySelector(".removeItem .itemPreview .description span").textContent = response.description;
            document.querySelector(".removeItem .itemPreview .author span").textContent = response.author;
            document.querySelector(".removeItem .itemPreview").classList.remove("hidden");
        }, (error) => {
            console.log(error);
        });
        //Re-enable the submit button
        document.querySelector(".removeItem .submitButton").disabled = false;
    } else {
        document.querySelector(".removeItem .submitButton").disabled = true;
    }
});

async function submitAddItemForm() {
    document.querySelector(".addItem .formContainer").classList.add("hidden");
    document.querySelector(".addItem .responseContainer").classList.add("hidden");
    document.querySelector(".addItem .loadingContainer").classList.remove("hidden");

    //Create UTC timestamp
    var park = document.querySelector("#park").value;
    var localUTCOffset = new Date().getTimezoneOffset();
    var parkUTCOffset = 0;
    switch (park) {
        case "DL":
            parkUTCOffset = 8 * 60;
            break;
        case "TDL":
            parkUTCOffset = -9 * 60;
            break;
        case "WDW":
            parkUTCOffset = 5 * 60;
            break;
    }
    var relativeOffset = parkUTCOffset - localUTCOffset;

    var date = document.querySelector("#date").value;
    var time = document.querySelector("#time").value;
    if (date && time) {
        var splitDate = date.split(/\D/);
        var splitTime = time.split(/\D/);
        var dateObject = new Date(splitDate[0], splitDate[1] - 1, splitDate[2], splitTime[0], splitTime[1] + relativeOffset);
        var timestamp = dateObject.getTime();
    } else if (date) {
        var splitDate = date.split(/\D/);
        var dateObject = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
        dateObject.setMinutes(dateObject.getMinutes() + relativeOffset);
        var timestamp = dateObject.getTime();
    }

    var formData = new FormData();
    
    var type = document.querySelector("#type").value;

    formData.append("type", type);
    if (type === "image") {
        var fileElement = document.querySelector("#file");
        if (fileElement.files.length > 0) {
            var file = fileElement.files[0];
            formData.append("image", file, file.name);
        }
    }
    if (type === "video" || type === "audio") {
        formData.append("video_id", document.querySelector("#videoID").value);
    }

    formData.append("name", document.querySelector("#name").value);
    formData.append("park", park);
    formData.append("description", document.querySelector("#description").value);

    var authorName = document.querySelector("#authorName").value;
    var authorURL = document.querySelector("#authorURL").value;
    if (authorName && authorURL) {
        formData.append("author", document.querySelector("#authorName").value + "[" + document.querySelector("#authorURL").value + "]");
    } else if (authorName) {
        formData.append("author", document.querySelector("#authorName").value);
    }

    if (timestamp) {
        formData.append("timestamp", timestamp);
    }

    formData.append("dateAdded", new Date.now());

    var metadata = {};
    var keys = ["make", "model", "focalLength", "software", "exposureTime", "fNumber", "flash", "colorSpace", "samplingRate", "precision"];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = document.querySelector("#" + key).value;
        if (value) {
            metadata[key] = value;
        }
    }
    formData.append("metadata", JSON.stringify(metadata));

    var response = await fetch('/admin/upload.php', {
        method: 'POST',
        body: formData
    });
    let result = await response.json();

    if (result.status === "success") {
        document.querySelector(".addItem .responseContainer .title").textContent = "Done.";
        document.querySelector(".addItem .responseContainer .subtitle").textContent = "Your item was added to the database.";
        document.querySelector(".addItem .responseContainer .message").textContent = "Item ID: " + result.id;
        document.querySelector(".addItem .responseContainer .retry").classList.add("hidden");
    } else {
        document.querySelector(".addItem .responseContainer .title").textContent = "Congratulations, you broke something.";
        document.querySelector(".addItem .responseContainer .subtitle").textContent = "Good going.";
        document.querySelector(".addItem .responseContainer .message").textContent = result.error;
        document.querySelector(".addItem .responseContainer .retry").classList.remove("hidden");
    }

    document.querySelector(".addItem .loadingContainer").classList.add("hidden");
    document.querySelector(".addItem .responseContainer").classList.remove("hidden");
}

async function submitRemoveItemForm() {
    document.querySelector(".removeItem .formContainer").classList.add("hidden");
    document.querySelector(".removeItem .responseContainer").classList.add("hidden");
    document.querySelector(".removeItem .loadingContainer").classList.remove("hidden");

    var formData = new FormData();

    formData.append("id", document.querySelector("#itemID").value);

    var response = await fetch('/admin/delete.php', {
        method: 'POST',
        body: formData
    });
    let result = await response.json();

    if (result.status === "success") {
        document.querySelector(".removeItem .responseContainer .title").textContent = "Done.";
        document.querySelector(".removeItem .responseContainer .subtitle").textContent = "Your item was removed from the database.";
        document.querySelector(".removeItem .responseContainer .message").textContent = "";
        document.querySelector(".removeItem .responseContainer .retry").classList.add("hidden");
    } else {
        document.querySelector(".removeItem .responseContainer .title").textContent = "Congratulations, you broke something.";
        document.querySelector(".removeItem .responseContainer .subtitle").textContent = "Good going.";
        document.querySelector(".removeItem .responseContainer .message").textContent = result.error;
        document.querySelector(".removeItem .responseContainer .retry").classList.remove("hidden");
    }

    document.querySelector(".removeItem .loadingContainer").classList.add("hidden");
    document.querySelector(".removeItem .responseContainer").classList.remove("hidden");
}