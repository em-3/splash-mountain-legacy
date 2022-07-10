<?php

require_once __DIR__ . "/init_admin.php";

/**
 * Checks if the incoming request is authenticated correctly and has the correct request method
 * @param string $required_method The HTTP method by which this endpoint must be accessed
 */
function check_request($required_method = "POST") {
    if(!check_authentication() || !check_clearance(0)) {
        http_response_code(401);
        header("Content-Type: application/json");
        die(json_encode(["status" => "error", "error" => "Not authenticated"]));
    }
    
    if($_SERVER["REQUEST_METHOD"] !== $required_method) {
        header("Content-Type: application/json");
        die(json_encode(["status" => "error", "error" => "Invalid request"]));
    }
}

?>