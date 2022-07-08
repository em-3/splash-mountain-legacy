<?php

require_once __DIR__ . "/../scripts/init_admin.php";

use SplmlFoundation\SplashMountainLegacyBackend\ArticleEntry;
use SplmlFoundation\SplashMountainLegacyBackend\Resource;

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
    //Start a transaction
    $database->beginTransaction();

    if(!isset($_POST["id"])) {
        throw new Exception("Cannot upload article without ID!");
    }

    $id = $_POST["id"];

    //Create an empty item
    $item = new ArticleEntry($database, "news_articles", $id);
    //Create an empty resource
    $resource = new Resource($database, "resource_associations", $resource_dir);

    //Check if the thumbnail field was provided
    if(isset($_POST["thumbnail"]) || isset($_FILES["thumbnail"])) {
        if(isset($_FILES["thumbnail"])) {
            //If it is a file, upload it
            $resource->useUploadedImage($_FILES["thumbnail"]);

            $_POST["thumbnail"] = $resource->getID();
        }else {
            //If it is not a file, add it to the item's data
            $resource->useResourceID($_POST["thumbnail"]);
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

    //Commit the transaction.
    $database->commit();

    //Output the ID
    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $id]));
}catch(Exception $e) {
    $database->rollBack();

    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>