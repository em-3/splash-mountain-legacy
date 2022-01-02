<?php

/**
 * Creates a new item.
 * @param array $item_data An associative array with item properties.
 * @param PDO $database The database connection.
 * @param array $image_data An uploaded image
 * @param string $resource_dir The directory where the image will be stored.
 * @return string The new item ID.
 */
function upload_item($item_data, $database, $image_data = null, $resource_dir=null) {
    //Define required and optional POST parameters
    $required_params = ["name", "type", "park", "author", "description"];
    $optional_params = ["video_id", "metadata", "timestamp"];

    $params = array();

    //Now check if all required parameters are present
    foreach($required_params as $param) {
        if(!isset($item_data[$param])) {
            throw new Exception("Missing required parameter: " . $param);
        }
        if(is_numeric($item_data[$param])) {
            $params[$param] = intval($item_data[$param]);
        } else {
            $params[$param] = $item_data[$param];
        }
    }

    //Add any optional parameters
    foreach($optional_params as $param) {
        if(isset($item_data[$param])) {
            if(is_numeric($item_data[$param])) {
                $params[$param] = intval($item_data[$param]);
            } else {
                $params[$param] = $item_data[$param];
            }
        }else {
            $params[$param] = null;
        }
    }

    //Generate a unique ID for the item
    $params["id"] = generate_id($database);

    //We can't have an image and a video id
    if($params["video_id"] != null && isset($image_data)) {
        throw new Exception("Cannot have an image and a video id");
    }

    //Check if the user uploaded an image
    if(isset($image_data)) {
        if(!isset($resource_dir)) {
            throw new Exception("Missing resource directory");
        }

        $image_dir = $resource_dir . "/" . $params["id"];

        //Check if the image is a valid image
        validate_uploaded_image($image_data);

        //Upload the image
        upload_image($image_data, $image_dir);

        //Generate a thumbnail
        generate_thumbnail($image_dir);
    }

    //Set up the database query
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

    if($stmt->rowCount() != 1) {
        throw new Exception("Failed to insert item into database");
    }

    //Return the ID of the item
    return $params["id"];
}

/**
 * Deletes an item from the database
 * @param string $item_id The item ID
 * @param PDO $database The database connection
 * @param string $resource_dir The resource directory where the item's image is stored
 * @return bool True if the item was deleted, false otherwise
 * @throws Exception If the item does not exist
 */
function delete_item($item_id, $database, $resource_dir) {
    //Check if the item exists in the database
    $stmt = $database->prepare("SELECT * FROM `item_index` WHERE `id` = ?");
    $stmt->bindValue(1, $item_id, PDO::PARAM_STR);
    $stmt->execute();

    if($stmt->rowCount() == 0) {
        throw new Exception("Item does not exist");
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

    return $stmt->rowCount() == 1;
}

/**
 * Validates the given file upload.
 * @param array $file The file upload
 * @throws Exception If the file upload is invalid
 */
function validate_uploaded_image($file) {
    $error = null;

    //Check if the file is over 10 MB
    if($file["size"] > 10485760) {
        $error = "File is too large";
    }

    //Check if the file is a png, jpeg, or gif
    $extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    if($extension != "png" && $extension != "jpeg" && $extension != "jpg" && $extension != "gif") {
        $error = "File is not a valid image";
    }

    if($error !== null) {
        throw new Exception($error);
    }
}

/**
 * Uploads the given image to the given directory.
 * WARNING: This function does perform any validation. Please see validate_uploaded_image() for more information.
 * @param array $image The image to upload
 * @param string $image_dir The directory to upload the image to
 * @throws Exception If the image could not be uploaded
 */
function upload_image($image, $image_dir) {
    //Create the image's unique directory
    if (!mkdir($image_dir, 0777, true)) {
        throw new Exception("Could not create image directory");
    }

    //Move the image to the directory
    if (!move_uploaded_file($image["tmp_name"], $image_dir . "/main")) {
        throw new Exception("Could not upload image");
    }
}

/**
 * Generates a thumbnail for the given image.
 * WARNING: This function expects the image to be present in the given directory.
 * @param string $image_dir The image directory
 * @throws Exception If the thumbnail could not be generated
 */
function generate_thumbnail($image_dir) {
    //Conver the image into a GD image
    $image_gd = imagecreatefromstring(file_get_contents($image_dir . "/main"));
    $thumbnail_gd = imagecreatetruecolor(256, 256);

    if(!$image_gd || !$thumbnail_gd) {
        throw new Exception("Failed to create GD image");
    }

    //Resize the image
    $image_width = imagesx($image_gd);
    $image_height = imagesy($image_gd);
    $crop_width = min($image_width, $image_height);
    $crop_height = min($image_width, $image_height);

    $x = ($image_width - $crop_width) / 2;
    $y = ($image_height - $crop_height) / 2;

    //Resample and crop the image
    if(!imagecopyresampled($thumbnail_gd, $image_gd, 0, 0, $x, $y, 256, 256, $crop_width, $crop_height)) {
        throw new Exception("Failed to resample image");
    }

    //Save the thumbnail
    if(!imagejpeg($thumbnail_gd, $image_dir . "/thumbnail")) {
        throw new Exception("Failed to save thumbnail");
    }
}

/**
 * Generates a random unique Base64 URL ID.
 * @param PDO $database The database connection
 * @return string The random Base64 URL ID
 * @throws Exception If the ID could not be generated
 */
function generate_id($database) {

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
    }

    throw new Exception("Failed to generate unique ID");
}

?>