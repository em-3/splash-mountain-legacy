<?php

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/endpoint_utils.php";

use SplmlFoundation\SplashMountainLegacyBackend\Entry\ItemEntry;

check_request();

try {
    $database->beginTransaction();

    //Require that an ID is given
    if(!isset($_POST["id"])) {
        throw new Exception("No ID provided");
    }

    $id = $_POST["id"];
    
    //Create a new item
    $item = new ItemEntry($database, "item_index", $id);

    //Update the item's data
    $item->putModifiedData($_POST);

    //Commit the changes
    $item->commit();

    $database->commit();

    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $item->getID()]));
}catch(Exception $e) {
    $database->rollBack();
    
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>