<?php

require_once __DIR__ . "/../../scripts/init.php";

$resource_dir = __DIR__ . "/../../resources/";

$url = $_SERVER["REQUEST_URI"];
$tokens = explode("/", substr($url, strlen("/api/item/")));

if(count($tokens) < 1) {
    http_response_code(400);
    die("Invalid request. No parameters specified.");
}

switch($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        handle_get();
        break;
    case "POST":
        handle_post();
        break;
    case "DELETE":
        handle_delete();
        break;
    default:
        header("Allow: GET, POST, DELETE");
        http_response_code(405);
        die("Method not allowed.");
        break;
}

function handle_get() {
    global $database;
    global $tokens;
    global $resource_dir;

    $item_id = $tokens[0];

    if(count($tokens) > 3) {
        http_response_code(400);
        die("Invalid request. Too many parameters.");
    }

    //Check if the item exists in the database
    $stmt = $database->prepare("SELECT * FROM `item_index` WHERE id = ?");
    $stmt->bindValue(1, $item_id, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_OBJ);

    if($result === false) {
        http_response_code(404);
        die("Item not found.");
    }

    if(count($tokens) == 1) {
        //Get the list of fragments for the item
        header("Content-Type: application/json");
        echo file_get_contents($resource_dir . "/" . $item_id . "/fragments.json");
    }else if($tokens[1] == "fragment") {
        //Get the requested fragment
        $fragment_id = $tokens[2];
        echo file_get_contents($resource_dir . "/" . $item_id . "/" . $fragment_id);
    }else if($tokens[1] == "details") {
        //Return the details of the item
        header("Content-Type: application/json");
        echo json_encode($result);
    }
}

function handle_post() {
    //TODO: Implement
}

function handle_delete() {
    //TODO: Implement
}