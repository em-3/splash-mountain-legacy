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
    if(isset($_POST["id"])) {
        $allowed_fields = ["title", "subtitle", "author", "content"];

        $database_entry = new DatabaseEntry($database, "news_articles", $allowed_fields, array(), $_POST["id"]);

        $database_entry->loadData($_POST);

        $id = $database_entry->saveEntry();

        header("Content-Type: application/json");
        exit(json_encode(["status" => "success", "id" => $id]));
    }else {
        $required_fields = ["title", "subtitle", "author", "content"];
        $optional_fields = ["publication_date"];

        $database_entry = new DatabaseEntry($database, "news_articles", $required_fields, $optional_fields);

        $database_entry->loadData($_POST);

        $id = $database_entry->saveEntry();

        header("Content-Type: application/json");
        exit(json_encode(["status" => "success", "id" => $id]));
    }
}catch(Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>