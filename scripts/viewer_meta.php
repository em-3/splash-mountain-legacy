<?php

require_once __DIR__ . "/../scripts/init.php";

function output_meta_tags($base_url, $table_name, $title_field, $description_field, $image_field) {
    global $database;
    //Get the item ID
    $url = $_SERVER["REQUEST_URI"];
    $tokens = explode("/", substr($url, strlen($base_url)));

    if(count($tokens) !== 2) {
        //Show error and stop the execution
        echo output_error();
        return;
    }

    //Get the item's details from the database
    $sql = "SELECT `$title_field`, `$description_field`, `$image_field` FROM `$table_name` WHERE `id` = ?";
    $stmt = $database->prepare($sql);
    $stmt->execute([$tokens[0]]);

    if($stmt->rowCount() !== 1) {
        echo output_error();
        return;
    }
    
    $results = $stmt->fetch(PDO::FETCH_ASSOC);
    $title = $results[$title_field];
    $description = $results[$description_field];

    echo <<<EOT
    <title>$title - Splash Mountain Legacy</title>
    <meta name="title" content="$title">
    <meta name="description" content="$description">
    EOT;

    if(!is_null($results[$image_field])) {
        $image = $results[$image_field];
        $image_url = "https://splashmountainlegacy.com/resources/$image/thumbnail";

        echo "<meta name=\"og:image\" content=\"$image_url\">";
    }
}

function output_error() {
    return <<<EOT
    <title>Error - Splash Mountain Legacy</title>
    <meta name="title" content="Error">
    <meta name="description" content="The article details could not be loaded.">
    EOT;
}

?>