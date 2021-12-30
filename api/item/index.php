<?php

require_once __DIR__ . "/../../scripts/init.php";

$url = $_SERVER["REQUEST_URI"];
$tokens = explode("/", substr($url, strlen("/api/item/")));
$resource_dir = __DIR__ . "/../../resources/";

if(count($tokens) < 1) {
    http_response_code(400);
    header("Content-Type: application/json");
    die(json_encode(["error" => "Invalid request. Too few parameters"]));
}

if(count($tokens) > 1) {
    http_response_code(400);
    header("Content-Type: application/json");
    die(json_encode(["error" => "Invalid request. Too many parameters"]));
}

$item_id = $tokens[0];

//Check if the item exists in the database
$stmt = $database->prepare("SELECT * FROM `item_index` WHERE `id` = ?");
$stmt->bindValue(1, $item_id, PDO::PARAM_STR);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_OBJ);

if($result === false) {
    http_response_code(404);
    header("Content-Type: application/json");
    die(json_encode(["error" => "Item not found"]));
}

//Return the details of the item
header("Content-Type: application/json");
echo json_encode($result);

?>