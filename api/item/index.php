<?php

require_once __DIR__ . "../../../scripts/init.php";
use SplmlFoundation\SplashMountainLegacyBackend\Resource;

//Get the item id from the url
$url = $_SERVER['REQUEST_URI'];
$tokens = explode("/", substr($url, strlen("/api/item/")));
$id = $tokens[0];

if($_SERVER["REQUEST_METHOD"] == "GET") {
    $resource = new Resource($id, __DIR__ . "../../resources/");
    $data = $resource->get_data();
    $mime_type = $resource->get_mime_type();

    header("Content-Type: " . $mime_type);
    echo $data;
}else if($_SERVER["REQUEST_METHOD"] == "POST") {
    //For now updating the resource is not supported so send the appropriate response code
    http_response_code(501);
}

?>