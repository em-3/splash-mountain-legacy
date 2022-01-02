<?php

require_once __DIR__ . "/scripts/init_admin.php";
require_once __DIR__ . "/scripts/item_utils.php";

if(!check_authentication()) {
    http_response_code(401);
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Not authenticated"]));
}

if($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Invalid request"]));
}

$resource_dir = __DIR__ . "/../resources";

try {
    if(!isset($_POST["id"])) {
        throw new Exception("Missing required parameter: id");
    }

    $item_id = $_POST["id"];
    $sucess = delete_item($item_id, $database, $resource_dir);

    if($sucess) {
        header("Content-Type: application/json");
        exit(json_encode(["status" => "success"]));
    } else {
        throw new Exception("Failed to delete item");
    }
}catch (Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>