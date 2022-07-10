<?php

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/endpoint_utils.php";

check_request("GET");

try {
    //Generate a unique ID
    $id = generate_id($database, "news_articles");

    //Output the ID
    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $id]));
}catch(Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}