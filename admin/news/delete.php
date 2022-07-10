<?php

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/endpoint_utils.php";

use SplmlFoundation\SplashMountainLegacyBackend\ArticleEntry;

check_request();

$resource_dir = __DIR__ . "/../../resources";

try {

    $database->beginTransaction();

    if(!isset($_POST["id"])) {
        throw new Exception("Missing required parameter: id");
    }

    //Create an empty item
    $item = new ArticleEntry($database, "news_articles", $_POST["id"]);

    //Load all resources that are associated with this item
    $associated_resources = $item->getAssociatedResources("resource_associations", $resource_dir, $item->getID());

    //Remove the item's affiliation from each resource and commit the change
    foreach($associated_resources as $resource) {
        $resource->dissociateID($item->getID());
        $resource->commitWithCleanup();
    }

    //Delete the item
    $item->deleteEntry();

    $database->commit();

    header("Content-Type: application/json");
    exit(json_encode(["status" => "success"]));
}catch (Exception $e) {
    $database->rollBack();
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>