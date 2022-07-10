<?php

require_once __DIR__ . "/../vendor/autoload.php";
use Dotenv\Dotenv;

//Load evnironment variables
$dotenv = Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

//Initialize database using environment variables
$database = new \PDO("mysql:host=" . $_ENV["DB_HOST"] . ";port=" . $_ENV["DB_PORT"] . ";dbname=" . $_ENV["DB_NAME"], $_ENV["DB_USER"], $_ENV["DB_PASS"]);

if(filter_var($_ENV["DEBUG"], FILTER_VALIDATE_BOOLEAN)) {
    $database->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
}

//Initiate the session
session_start();

/**
 * Checks if the user is logged in
 * @return bool true if logged in, false if not
 */
function check_authentication() {
    return isset($_SESSION["id"]) && $_SESSION["id"] != "";
}

/**
 * Checks if the current user has the specified clearance level or higher
 * @param int $clearance The clearance level required to pass
 * @return bool true if the user meets the required clearance level, false if not
 */
function check_clearance($clearance) {
    return isset($_SESSION["clearance"]) && $_SESSION["clearance"] <= $clearance;
}

?>