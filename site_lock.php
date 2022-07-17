<?php

require_once __DIR__ . "/scripts/init.php";

//Don't do anything if this is the login page
if($_SERVER['PHP_SELF'] == '/login/index.php') {
    return;
}

//If the launch window is already passed then do nothing
if(time() > 1658088000) {
    return;
}

//Check if the user is logged in and has access to the site. If not, redirect to the countdown page.
if(!check_authentication() && !check_clearance(1)) {
    header("Location: /countdown");
    exit;
}

?>