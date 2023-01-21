<?php

require_once __DIR__ . "/../../scripts/init.php";

//Fetch all authors for every cell in the DB
$authorResults = $database->query("SELECT `author` FROM `item_index`");

//Create an array of all authors
$authors = $authorResults->fetchAll(PDO::FETCH_COLUMN);

//Remove null items
$authors = array_filter($authors, function($author) {
    return $author !== null;
});

//Remove duplicates
$authors = array_unique($authors);

//Sort Alphabetically
sort($authors, SORT_NATURAL | SORT_FLAG_CASE);

//Output the arry as JSON
header("Content-Type: application/json");
echo json_encode(array_values($authors));

?>