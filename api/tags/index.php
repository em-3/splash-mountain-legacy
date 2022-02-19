<?php

require_once __DIR__ . "/../../scripts/init.php";

//Fetch all tags for every cell in the DB
$tagResults = $database->query("SELECT `tags` FROM `item_index`");

//Create an array of all tags
$tags = $tagResults->fetchAll(PDO::FETCH_COLUMN);

//Extract the tags into arrays
$tags = array_map(function($tag) {
    if($tag == "") {
        return;
    }

    return explode(",", $tag);
}, $tags);

//Remove null items
$tags = array_filter($tags, function($tag) {
    return $tag !== null;
});

//Flatten the array
$tags = call_user_func_array("array_merge", $tags);

//Remove duplicates
$tags = array_unique($tags);

//Output the arry as JSON
header("Content-Type: application/json");
echo json_encode(array_values($tags));

?>