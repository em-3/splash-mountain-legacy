<?php

require_once __DIR__ . "/../vendor/autoload.php";
use Dotenv\Dotenv;

//Load evnironment variables
$dotenv = Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

//Initialize database using environment variables
$database = new \PDO("mysql:host=" . $_ENV["DB_HOST"] . ";port=" . $_ENV["DB_PORT"] . ";dbname=" . $_ENV["DB_NAME"], $_ENV["DB_USER"], $_ENV["DB_PASS"]);

?>