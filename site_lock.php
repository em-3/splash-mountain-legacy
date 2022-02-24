<?php

require_once __DIR__ . "/admin/scripts/init_admin.php";

//Don't do anything if this is the login page
if($_SERVER['PHP_SELF'] == '/admin/login') {
    return;
}

//Check if the user is logged in. If not, redirect to the countdown page.
if(!check_authentication()) {
    header("Location: /countdown");
    exit;
}

?>