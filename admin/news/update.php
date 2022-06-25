<?php

require_once __DIR__ . "/../scripts/init_admin.php";
use SplmlFoundation\SplashMountainLegacyBackend\DatabaseEntry;
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
    //Start a transaction
    $database->beginTransaction();

    if(!isset($_POST["id"])) {
        throw new Exception("ID field required to update article!");
    }

    $allowed_fields = ["title", "subtitle", "author", "content", "thumbnail"];

    //Update the existing article
    $database_entry = new DatabaseEntry($database, "news_articles", array(), $allowed_fields, $_POST["id"]);

    $database_entry->loadData($_POST);

    $id = $database_entry->saveEntry();

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