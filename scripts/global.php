<?php

require_once __DIR__ . "/init.php";

if(isset($_ENV["MAINTENANCE"]) && $_ENV["MAINTENANCE"] == true) {
    if(!check_authentication() && !check_clearance(0)) {
        //Redirect to the maintenance page
        header("Location: /unavailable");
        exit;
    }
}

?>