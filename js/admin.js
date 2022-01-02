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

document.body.addEventListener("input", function () {
    var requiredFields = document.querySelectorAll("*[required]");
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        var value = field.value;
        if (!value) {
            document.querySelector("#submitButton").disabled = true;
            return;
        }
    }
    document.querySelector("#submitButton").disabled = false;
});

async function submitForm() {
    document.querySelector(".formContainer").classList.add("hidden");
    document.querySelector(".responseContainer").classList.add("hidden");
    document.querySelector(".loadingContainer").classList.remove("hidden");

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

    var metadata = {};
    var keys = ["make", "model", "focalLength", "software", "exposureTime", "fNumber", "flash", "colorSpace", "samplingRate"];
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
        document.querySelector(".responseContainer .title").textContent = "Done.";
        document.querySelector(".responseContainer .subtitle").textContent = "Your item was added to the database.";
        document.querySelector(".responseContainer .message").textContent = "Item ID: " + result.id;
    } else {
        document.querySelector(".responseContainer .title").textContent = "Congratulations, you broke something.";
        document.querySelector(".responseContainer .subtitle").textContent = "Good going.";
        document.querySelector(".responseContainer .message").textContent = result.error;
    }

    document.querySelector(".loadingContainer").classList.add("hidden");
    document.querySelector(".responseContainer").classList.remove("hidden");
}