<?php

require_once __DIR__ . "/../../scripts/init.php";
use SplmlFoundation\SplashMountainLegacyBackend\DatabaseEntry;

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
    $optional_params = ["author", "video_id", "source", "metadata", "tags", "timestamp", "hidden"];

    $database_entry = new DatabaseEntry($database, "item_index", $required_params, $optional_params);

    $database_entry->loadData($item_data);

    $database->beginTransaction();

    $id = null;

    //Insert the item into the database.
    try {
        $id = $database_entry->saveEntry();
    }catch(\Exception $e) {
        $database->rollBack();
        throw $e;
    }

    //Check if the user uploaded an image
    try {
        if(isset($image_data)) {
            if(!isset($resource_dir)) {
                throw new Exception("Missing resource directory");
            }

            $image_dir = $resource_dir . "/" . $id;

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

    //Commit the transaction
    $database->commit();

    //Return the ID of the item
    return $id;
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
    $available_params = ["name", "park", "description", "author", "video_id", "source", "metadata", "tags", "timestamp", "hidden"];

    $id = $item_data["id"];

    //Create a database entry to modify the item
    $database_entry = new DatabaseEntry($database, "item_index", array(), $available_params, $id);

    //Load the data into the database entry
    $database_entry->loadData($item_data);

    //Begin a transaction in case something goes wrong
    $database->beginTransaction();

    //Try to update the item
    try {
        $database_entry->saveEntry();
    }catch(\Exception $e) {
        $database->rollBack();
        throw $e;
    }

    //Commit the transaction
    $database->commit();

    return $id;
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
    //Create a database entry to delete the item
    $database_entry = new DatabaseEntry($database, "item_index", array(), array(), $item_id);

    //Start a transaction in case something goes wrong
    $database->beginTransaction();

    //Delete the item
    try {
        $database_entry->deleteEntry();
    }catch(\Exception $e) {
        $database->rollBack();
        throw $e;
    }

    //Delete the item's data folder if it has one
    if(file_exists($resource_dir . "/" . $item_id)) {
        unlink($resource_dir . "/" . $item_id . "/main");
        unlink($resource_dir . "/" . $item_id . "/thumbnail");
        rmdir($resource_dir . "/" . $item_id);
    }

    //Commit the transaction if everything worked
    $database->commit();

    return true;
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

?>