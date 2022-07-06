<?php

require_once __DIR__ . "/../scripts/init_admin.php";

use SplmlFoundation\SplashMountainLegacyBackend\Resource;
use SplmlFoundation\SplashMountainLegacyBackend\ResourceManager;

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
    //Begin a database transaction
    $database->beginTransaction();

    //Ensure that an image was uploaded
    if(!isset($_FILES["resource"])) {
        throw new Exception("No resource uploaded!");
    }

    //Ensure that an associated ID was provided
    if(!isset($_POST["associated_id"])) {
        throw new Exception("No associated ID provided!");
    }

    //Create the resource
    $resource = new Resource($database, "resource_associations", $resource_dir);
    $resource->useUploadedImage($_FILES["resource"]);
    $resource->load();
    $resource->associateID($_POST["associated_id"]);

    $resource->commitWithCleanup();

    //Commit the transaction
    $database->commit();

    //Output the ID of the resource
    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $resource->getID()]));
}catch(Exception $e) {
    //Rollback the database
    $database->rollBack();

    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>