<?php

require_once __DIR__ . "/../../scripts/init.php";

//Initiate the session
session_start();

/**
 * Checks if the user is logged in
 * @return bool true if logged in, false if not
 */
function check_authentication() {
    return isset($_SESSION["id"]) && $_SESSION["id"] != "";
}

?>