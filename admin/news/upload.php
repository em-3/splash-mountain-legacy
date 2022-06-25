<?php

require_once __DIR__ . "/../scripts/init_admin.php";
use SplmlFoundation\SplashMountainLegacyBackend\DatabaseEntry;

if(!check_authentication()) {
    http_response_code(401);
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Not authenticated"]));
}

if($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Invalid request"]));
}

try {
    //Start a transaction
    $database->beginTransaction();

    //If there is an ID, we are updating an existing article.
    if(isset($_POST["id"])) {
        $allowed_fields = ["title", "subtitle", "author", "content", "thumbnail"];

        //Update the existing article
        $database_entry = new DatabaseEntry($database, "news_articles", array(), $allowed_fields, $_POST["id"]);

        $database_entry->loadData($_POST);

        $id = $database_entry->saveEntry();

        //Commit the transaction
        $database->commit();

        //Output the ID
        header("Content-Type: application/json");
        exit(json_encode(["status" => "success", "id" => $id]));
    }else {
        $required_fields = ["title", "subtitle", "author", "content", "thumbnail"];
        $optional_fields = ["publication_date"];

        //Create a database entry for the article
        $database_entry = new DatabaseEntry($database, "news_articles", $required_fields, $optional_fields);

        $database_entry->loadData($_POST);

        $id = $database_entry->saveEntry();

        //Commit the transaction 
        $database->commit();

        //Output the ID
        header("Content-Type: application/json");
        exit(json_encode(["status" => "success", "id" => $id]));
    }
}catch(Exception $e) {
    $database->rollBack();

    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>