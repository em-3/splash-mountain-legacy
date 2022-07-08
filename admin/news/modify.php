<?php

require_once __DIR__ . "/../scripts/init_admin.php";

use SplmlFoundation\SplashMountainLegacyBackend\ArticleEntry;
use SplmlFoundation\SplashMountainLegacyBackend\DatabaseEntry;

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

    //Require that an ID is given
    if(!isset($_POST["id"])) {
        throw new Exception("No ID provided");
    }

    $id = $_POST["id"];
    
    //Create a new item
    $item = new ArticleEntry($database, "news_articles", $id);

    //Update the item's data
    $item->putModifiedData($_POST);

    //Commit the changes
    $item->commit();

    //Commit the transaction
    $database->commit();

    //Output the ID
    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $id]));
}catch(Exception $e) {
    $database->rollBack();

    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}