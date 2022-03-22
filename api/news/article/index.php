<?php

require_once __DIR__ . "/../../../scripts/init.php";

$url = $_SERVER["REQUEST_URI"];
$tokens = explode("/", substr($url, strlen("/api/news/article/")));

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

$article_id = $tokens[0];

//Check if the article exists in the database
$stmt = $database->prepare("SELECT * FROM `news_articles` WHERE `id` = ?");
$stmt->bindValue(1, $article_id, PDO::PARAM_STR);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_OBJ);

if($result === false) {
    http_response_code(404);
    header("Content-Type: application/json");
    die(json_encode(["error" => "Article not found"]));
}

//Return the details of the article
header("Content-Type: application/json");
echo json_encode($result);

?>