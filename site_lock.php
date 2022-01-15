<?php

require_once __DIR__ . "/admin/scripts/init_admin.php";

//Don't do anything if this is the login page
if($_SERVER['PHP_SELF'] == '/admin/login.php') {
    return;
}

//Check if the user is logged in
if(!check_authentication()) {
    header("Location: /admin/login.php");
    exit;
}

?>