<?php

use SplmlFoundation\SplashMountainLegacyBackend\ItemEntry;
use SplmlFoundation\SplashMountainLegacyBackend\Resource;

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/item_utils.php";

if(!check_authentication()) {
    http_response_code(401);
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Not authenticated"]));
}

if($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Invalid request"]));
}

$resource_dir = __DIR__ . "/../../resources";

try {
    $database->beginTransaction();

    //Require that an ID is given
    if(!isset($_POST["id"])) {
        throw new Exception("No ID provided");
    }

    $id = $_POST["id"];

    //Create an empty item
    $item = new ItemEntry($database, "item_index", $id);
    //Create an empty resource
    $resource = new Resource($database, "resource_associations", $resource_dir);

    //Check if the image field was provided
    if(isset($_POST["image"]) || isset($_FILES["image"])) {
        if(isset($_FILES["image"])) {
            //If it is a file, upload it
            $resource->useUploadedImage($_FILES["image"]);
    
            $item->setDataField("image", $resource->getID());
        }else {
            //If it is not a file, add it to the item's data
            $item->setDataField("image", $_POST["image"]);

            $resource->useResourceID($_POST["image"]);
        }

        //Load the resource's info and associate the item ID with the resource.
        $resource->load();
        $resource->associateID($id);
    }

    //Add the required data to the item's data, as well as the optional data.
    $item->putRequiredData($_POST);
    $item->putOptionalData($_POST);
    //Store the item's data in the item's table.
    $item->commit();
    $resource->commitWithCleanup();

    $database->commit();

    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $item->getID()]));
}catch(Exception $e) {
    $database->rollBack();

    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>