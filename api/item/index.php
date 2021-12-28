<?php

require_once __DIR__ . "/../../scripts/init.php";

use RobThree\Auth\TwoFactorAuth;

$url = $_SERVER["REQUEST_URI"];
$tokens = explode("/", substr($url, strlen("/api/item/")));
$resource_dir = __DIR__ . "/../../resources/";

if(count($tokens) < 1) {
    http_response_code(400);
    header("Content-Type: application/json");
    die(json_encode(["error" => "Invalid request. Too few parameters"]));
}

switch($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        handle_get();
        break;
    case "POST":
        handle_post();
        break;
    case "DELETE":
        handle_delete();
        break;
    default:
        http_response_code(405);
        header("Allow: GET, POST, DELETE");
        header("Content-Type: application/json");
        die(json_encode(["error" => "Method not allowed"]));
        break;
}

function handle_get() {
    global $database;
    global $tokens;

    $item_id = $tokens[0];

    if(count($tokens) > 1) {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Invalid request. Too many parameters"]));
    }

    //Check if the item exists in the database
    $stmt = $database->prepare("SELECT * FROM `item_index` WHERE `id` = ?");
    $stmt->bindValue(1, $item_id, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_OBJ);

    if($result === false) {
        http_response_code(404);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Item not found"]));
    }

    //Return the details of the item
    header("Content-Type: application/json");
    echo json_encode($result);
}

function handle_post() {
    global $database;
    global $tokens;
    global $resource_dir;

    if(count($tokens) > 1) {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Invalid request. Too many parameters"]));
    }

    if($tokens[0] != "create") {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Invalid request. Only 'create' is allowed for POST."]));
    }

    authenticate();

    //Define required and optional POST parameters
    $required_params = ["name", "type", "park", "author", "description", "timestamp"];
    $optional_params = ["video_id", "metadata"];

    $params = array();

    //Now check if all required parameters are present
    foreach($required_params as $param) {
        if(!isset($_POST[$param])) {
            http_response_code(400);
            header("Content-Type: application/json");
            die(json_encode(["error" => "Invalid request. Missing parameter '" . $param . "'"]));
        }
        if(is_numeric($_POST[$param])) {
            $params[$param] = intval($_POST[$param]);
        } else {
            $params[$param] = $_POST[$param];
        }
    }

    //Add any optional parameters
    foreach($optional_params as $param) {
        if(isset($_POST[$param])) {
            if(is_numeric($_POST[$param])) {
                $params[$param] = intval($_POST[$param]);
            } else {
                $params[$param] = $_POST[$param];
            }
        }else {
            $params[$param] = null;
        }
    }

    //Generate a unique ID for the item
    $params["id"] = generate_id();

    //We can't have an image and a video id
    if($params["video_id"] != null && isset($_FILES["image"])) {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Invalid request. Cannot have both an image and a video id"]));
    }

    //Check if the user uploaded an image
    if(isset($_FILES["image"])) {
        $image_dir = $resource_dir . "/" . $params["id"];

        //Check if the image is a valid image
        validate_uploaded_image($_FILES["image"]);

        //Upload the image
        upload_image($_FILES["image"], $image_dir, $params["id"]);

        //Generate a thumbnail
        generate_thumbnail($params["id"], $image_dir);
    }

    //Insert the item data into the database
    $stmt = "INSERT INTO `item_index` (";

    //Add the parameters to the query
    foreach($params as $key => $value) {
        $stmt .= "`" . $key . "`, ";
    }

    //Remove the trailing comma
    $stmt = substr($stmt, 0, -2);

    $stmt .= ") VALUES (";

    //Add the values to the query
    foreach($params as $key => $value) {
        $stmt .= ":$key, ";
    }

    //Remove the trailing comma
    $stmt = substr($stmt, 0, -2);

    $stmt .= ")";

    $stmt = $database->prepare($stmt);

    //Bind the values to the query
    foreach($params as $key => $value) {
        if($value === null) {
            $stmt->bindValue($key, null, PDO::PARAM_NULL);
        }else if(is_int($value)) {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        }else {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
    }

    //Execute the query
    $stmt->execute();

    //Ensure that the item was inserted
    if($stmt->rowCount() != 1) {
        http_response_code(500);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Failed to insert item into database"]));
    }

    //Return the item id
    header("Content-Type: application/json");
    echo json_encode(["id" => $params["id"]]);

}

function handle_delete(){
    global $database;
    global $tokens;
    global $resource_dir;

    if(count($tokens) > 1) {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Invalid request. Too many parameters"]));
    }

    authenticate();

    $item_id = $tokens[0];

    //Check if the item exists in the database
    $stmt = $database->prepare("SELECT * FROM `item_index` WHERE `id` = ?");
    $stmt->bindValue(1, $item_id, PDO::PARAM_STR);
    $stmt->execute();

    if($stmt->rowCount() == 0) {
        http_response_code(404);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Item not found"]));
    }

    //Delete the item's data folder if it has one
    if(file_exists($resource_dir . "/" . $item_id)) {
        unlink($resource_dir . "/" . $item_id . "/main");
        unlink($resource_dir . "/" . $item_id . "/thumbnail");
        rmdir($resource_dir . "/" . $item_id);
    }

    //Delete the item from the database
    $stmt = $database->prepare("DELETE FROM `item_index` WHERE `id` = ?");
    $stmt->bindValue(1, $item_id, PDO::PARAM_STR);
    $stmt->execute();

    //Ensure that the item was deleted
    if($stmt->rowCount() != 1) {
        http_response_code(500);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Failed to delete item from database"]));
    }

    //Return success
    header("Content-Type: application/json");
    echo json_encode(["success" => true]);
}

/**
 * Checks the user's authentication token.
 */
function authenticate() {
    $request_headers = apache_request_headers();

    //Ensure that the request has an Authorization header
    if(!isset($request_headers["Authorization"])) {
        http_response_code(401);
        header("WWW-Authenticate: OTP realm=\"Item API\"");
        header("Content-Type: application/json");
        die(json_encode(["error" => "Unauthorized. No Authorization header found."]));
    }

    //Ensure that the request has an OTP header
    $authorization = $request_headers["Authorization"];
    $authorization_tokens = explode(" ", $authorization);
    
    //Check that the Authorization header has the correct format
    if(count($authorization_tokens) != 2 || $authorization_tokens[0] != "OTP") {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Unauthorized. Invalid Authorization header."]));
    }

    //Ensure that the OTP is valid
    $otp = $authorization_tokens[1];
    $tfa = new TwoFactorAuth("Item API");

    if($tfa->verifyCode($_ENV["OTP_SECRET"], $otp)) {
        return true;
    }else {
        http_response_code(401);
        header("WWW-Authenticate: OTP realm=\"Item API\"");
        header("Content-Type: application/json");
        die(json_encode(["error" => "Unauthorized. Invalid OTP."]));
    }
}

/**
 * Generates a random Base64 ID.
 */
function generate_id() {
    global $database;

    $index = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    for($i = 0; $i < 100; $i++) {

        //Generate an id
        $id = "";
        for($i = 0; $i < 11; $i++) {
            $id .= $index[mt_rand(0, 61)];
        }

        //Check if the ID is unique
        $stmt = $database->prepare("SELECT * FROM `item_index` WHERE `id` = ?");
        $stmt->bindValue(1, $id, PDO::PARAM_STR);
        $stmt->execute();
        
        //If the result set is empty, then the ID is unique
        if($stmt->rowCount() == 0) {
            return $id;
        }

        if($i == 99) {
            http_response_code(500);
            header("Content-Type: application/json");
            die(json_encode(["error" => "Failed to generate unique ID"]));
        }
    }
}

/**
 * Validates the given file upload.
 */
function validate_uploaded_image($file) {
    $error = null;

    //Check if the file is over 10 MB
    if($file["size"] > 10485760) {
        $error = "File is too large";
    }

    //Check if the file is a png, jpeg, or gif
    $extension = pathinfo($file["name"], PATHINFO_EXTENSION);
    if($extension != "png" && $extension != "jpeg" && $extension != "jpg" && $extension != "gif") {
        $error = "File is not a valid image";
    }

    if($error !== null) {
        http_response_code(400);
        header("Content-Type: application/json");
        die(json_encode(["error" => $error]));
    }
}

/**
 * Uploads the given image to the given directory.
 */
function upload_image($image, $image_dir) {
    //Create the image's unique directory
    if (!mkdir($image_dir, 0777, true)) {
        http_response_code(500);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Failed to create directory"]));
    }

    //Move the image to the directory
    if (!move_uploaded_file($image["tmp_name"], $image_dir . "/main")) {
        http_response_code(500);
        header("Content-Type: application/json");
        die(json_encode(["error" => "Failed to move image"]));
    }
}

/**
 * Generates a thumbnail for the given image.
 */
function generate_thumbnail($id, $image_dir) {
    //Conver the image into a GD image
    $image_gd = imagecreatefromstring(file_get_contents($image_dir . "/main"));
    $thumbnail_gd = imagecreatetruecolor(256, 256);

    //Resize the image
    $image_width = imagesx($image_gd);
    $image_height = imagesy($image_gd);
    $crop_width = min($image_width, $image_height);
    $crop_height = min($image_width, $image_height);

    $x = ($image_width - $crop_width) / 2;
    $y = ($image_height - $crop_height) / 2;

    //Resample and crop the image
    imagecopyresampled($thumbnail_gd, $image_gd, 0, 0, $x, $y, 256, 256, $crop_width, $crop_height);

    //Save the thumbnail
    imagejpeg($thumbnail_gd, $image_dir . "/thumbnail");
}

?>