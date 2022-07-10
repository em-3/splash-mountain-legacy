<?php

require_once __DIR__ . "/../../scripts/init.php";

/**
 * Generates a random unique Base38 URL ID.
 * @param PDO $database The database to check the generated ID against
 * @param string $table_name The name of the table to check the generated ID against
 * @return string The random Base38 URL ID
 * @throws Exception If the ID could not be generated
 */
function generate_id($database, $table_name) {
    $index = "abcdefghijklmnopqrstuvwxyz0123456789-_";

    $stmt = $database->prepare("SELECT id FROM `$table_name` WHERE `id` = ?");

    for($i = 0; $i < 100; $i++) {

        //Generate an id
        $id = "";
        for($i = 0; $i < 11; $i++) {
            $id .= $index[mt_rand(0, 37)];
        }
        
        //Check if the ID is unique
        $stmt->bindValue(1, $id);
        $stmt->execute();
        
        //If the result set is empty, then the ID is unique
        if($stmt->rowCount() == 0) {
            return $id;
        }
    }

    throw new \Exception("Failed to generate unique ID");
}

?>