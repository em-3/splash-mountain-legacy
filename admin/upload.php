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
    $image_data = null;

    if(isset($_FILES["image"])) {
        $image_data = $_FILES["image"];
    }

    $id = upload_item($_POST, $database, $image_data, $resource_dir);

    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "id" => $id]));
}catch(Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>