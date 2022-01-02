document.querySelector("#file").onchange = function(e) {
    var file = e.target.files[0]
    if (file && file.name) {
        EXIF.getData(file, function() {
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