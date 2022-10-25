<?php

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/endpoint_utils.php";

check_request("GET");

$sql = "SELECT `id`, `timestamp`, `type`, `action`, `item_id`, `user_id`, `changes` FROM `audit_log` ORDER BY `timestamp` DESC";

try {
    $stmt = $database->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //Output the ID
    header("Content-Type: application/json");
    exit(json_encode(["status" => "success", "audit_data" => $results]));
}catch(Exception $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "error" => $e->getMessage()]));
}

?>