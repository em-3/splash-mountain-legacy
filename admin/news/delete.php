<?php

require_once __DIR__ . "/../scripts/init_admin.php";
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

try {
    if(!isset($_POST["id"])) {
        throw new Exception("Missing required parameter: id");
    }

    $database_entry = new DatabaseEntry($database, "news_articles", array(), array(), $_POST["id"]);

    $sucess = $database_entry->deleteEntry();

    if($sucess) {
        header("Content-Type: application/json");
        exit(json_encode(["status" => "success"]));
    } else {
        throw new Exception("Failed to delete article: article does not exist");
    }
}catch (Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>