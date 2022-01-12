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
    $required_params = ["name", "type", "park", "description"];
    $optional_params = ["author", "video_id", "source", "metadata", "timestamp", "hidden"];

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
        }
    }

    //Generate a unique ID for the item
    $params["id"] = generate_id($database);

    //We can't have an image and a video id
    if(isset($params["video_id"]) && isset($image_data)) {
        throw new Exception("Cannot have an image and a video id");
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

    $database->beginTransaction();

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

    //Check if the user uploaded an image
    try {
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
    }catch(Exception $e) {
        //Rollback the transaction
        $database->rollBack();

        //Delete any uploaded images
        if(file_exists($image_dir . "/main")) {
            unlink($image_dir . "/main");
        }

        if(file_exists($image_dir . "/thumbnail")) {
            unlink($image_dir . "/thumbnail");
        }

        if(is_dir($image_dir)) {
            rmdir($image_dir);
        }

        //Throw the exception for the caller
        throw $e;
    }

    $database->commit();

    //Return the ID of the item
    return $params["id"];
}

/**
 * Changes an item's data in the database
 * @param array $item_data An associative array with item properties.
 * @param PDO $database The database connection.
 * @return bool True if the item was updated successfully. False otherwise.
 * @throws Exception If there was an error updating the item.
 */
function modify_item($item_data, $database) {
    if(!isset($item_data["id"])) {
        throw new Exception("Missing item ID");
    }

    //Define available parameters
    $available_params = ["name", "park", "description", "author", "video_id", "source", "metadata", "timestamp", "hidden"];

    $params = array();

    $params["id"] = $item_data["id"];

    //Add any available parameters
    foreach($available_params as $param) {
        if(isset($item_data[$param])) {
            if(is_numeric($item_data[$param])) {
                $params[$param] = intval($item_data[$param]);
            } else {
                $params[$param] = $item_data[$param];
            }
        }
    }

    if(count($params) < 2) {
        throw new Exception("No parameters given to update");
    }

    //Prepare the query
    $stmt = "UPDATE `item_index` SET ";

    foreach($params as $key => $value) {
        $stmt .= "`" . $key . "` = :" . $key . ", ";
    }

    //Remove the trailing comma
    $stmt = substr($stmt, 0, -2);

    $stmt .= " WHERE `id` = :id";

    $database->beginTransaction();

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
    try {
        $stmt->execute();
    }catch(Exception $e) {
        $database->rollBack();
        throw $e;
    }

    $database->commit();

    return true;
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

    //Resize the image
    $image_width = imagesx($image_gd);
    $image_height = imagesy($image_gd);

    $thumbnail_width = 256;
    $thumbnail_height = 256;

    if($image_width > $image_height) {
        $thumbnail_height = 256 * $image_height / $image_width;
    }else if($image_width < $image_height) {
        $thumbnail_width = 256 * $image_width / $image_height;
    }

    $thumbnail_gd = imagecreatetruecolor($thumbnail_width, $thumbnail_height);

    if(!$image_gd || !$thumbnail_gd) {
        throw new Exception("Failed to create GD image");
    }

    //Resample the image
    if(!imagecopyresampled($thumbnail_gd, $image_gd, 0, 0, 0, 0, $thumbnail_width, $thumbnail_height, $image_width, $image_height)) {
        throw new Exception("Failed to resize image");
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