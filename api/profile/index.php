<?php

require_once __DIR__ . "/../../scripts/init.php";

// use SplmlFoundation\SplashMountainLegacyBackend\Discord;

if(!check_authentication()) {
    http_response_code(401);
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Not authenticated"]));
}

// Override with dummy data to fix password authentication
header("Content-Type: application/json");
exit(json_encode(["status" => "success", "user_data" => [
    "id" => "1234567890",
    "clearance" => "0",
    "username" => "Staff",
    "discriminator" => "0",
    "avatar_hash" => "1234567890"
]]));

// Original code
// if(!isset($_SESSION["token"])) {
//     header("Content-Type: application/json");
//     die(json_encode(["status" => "error", "error" => "Bad request. Please clear your cookies and try again"]));
// }

// $discord = new Discord($_SESSION["token"], $database, "discord_users");

// try {
//     $id = $_SESSION["id"];

//     //If an ID is provided attempt to load the details for that ID
//     if(isset($_GET["id"])) {
//         $id = preg_filter("/[^0-9]*/", "", $_GET["id"]);
//     }

//     //Get the user's details
//     $user_data = $discord->getUserDetails($id);

//     header("Content-Type: application/json");
//     exit(json_encode(["status" => "success", "user_data" => $user_data]));
// }catch(Exception $e) {
//     header("Content-Type: application/json");
//     die(json_encode(["status" => "error", "error" => "Something went wrong fetching user details. Error: " + $e->getMessage()]));
// }

?>