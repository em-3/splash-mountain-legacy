<?php

require_once __DIR__ . "/../../scripts/init.php";

use League\OAuth2\Client\Token\AccessToken;
use Wohali\OAuth2\Client\Provider\Discord;

if(!check_authentication()) {
    http_response_code(401);
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Not authenticated"]));
}

if(!isset($_SESSION["token"])) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Bad request. Please clear your cookies and try again"]));
}

//Check if user is in cooldown mode 
if(isset($_SESSION["cooldown"]) && time() < $_SESSION["cooldown"]) {
    //If the cooldown hasn't ended yet extend it by tries^2
    $_SESSION["cooldown"] += $_SESSION["tries"]^2;
    $_SESSION["tries"]++;

    //Output a cooldown error
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "You're accessing the endpoint too fast. Please wait a bit until trying again"]));
}else {
    //Otherwise reset the cooldown
    $_SESSION["cooldown"] = time() + 5;
    $_SESSION["tries"] = 1;
}

$_SESSION["last_accessed"] = time();

$provider = new Discord([
    "clientId" => $_ENV["DISCORD_CLIENT_ID"],
    "clientSecret" => $_ENV["DISCORD_CLIENT_SECRET"],
    "redirectUri" => $_ENV["DISCORD_REDIRECT_URI_PREFIX"] . "/login/index.php"
]);

try {
    //Get the user's details
    $user = $provider->getResourceOwner(new AccessToken(["access_token" => $_SESSION["token"]]));

    $user_data = new stdClass();
    $user_data->clearance = $_SESSION["clearance"];
    $user_data->username = $user->getUsername() . "#" . $user->getDiscriminator();
    $user_data->avatar_url = "https://cdn.discordapp.com/avatars/" . $user->getID() . "/" . $user->getAvatarHash();

    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "user_data" => json_encode($user_data)]));
}catch(Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => "Something went wrong fetching user details. Error: " + $e->getMessage()]));
}

?>