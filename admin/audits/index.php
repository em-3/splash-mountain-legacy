<?php

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/endpoint_utils.php";

check_request("GET");

$sql = "SELECT `id`, `timestamp`, `type`, `action`, `item_id`, `user_id`, `changes` FROM `audit_log`";
$min = 0;
$max = 0;

if(isset($_GET["filter_type"]) && isset($_GET["filter_value"])) {
    $allowed_values = ["user_id", "item_id", "type", "action"];
    $filter_type = $_GET["filter_type"];
    foreach($allowed_values as $value) {
        if($filter_type == $value) {
            $sql .= " WHERE " . $filter_type . " = :fvalue";
            break;
        }
    }
}

if(isset($_GET["sort_order"]) && ($_GET["sort_order"] == "oldest_first")) {
    $sql .= " ORDER BY `timestamp` ASC";
} else {
    $sql .= " ORDER BY `timestamp` DESC";
}

if(isset($_GET["max"])) {
    $max_value = intval($_GET["max"]);

    if(isset($_GET["min"])) {
        //If there's a minimum value specified, then add it to the parameters and calculate the difference between the min and max values
        $min_value = intval($_GET["min"]);

        $min = $min_value - 1;
        $max = $max_value - $min_value;
    }else {
        //Otherwise just add zero and the max value
        $min = 0;
        $max = $max_value;
    }

    //Update the statement to include the min and max
    $sql .= " LIMIT :min, :max";
}

try {
    $stmt = $database->prepare($sql);

    if(isset($_GET["filter_type"]) && isset($_GET["filter_value"])) {
        $stmt->bindValue(":fvalue", $_GET["filter_value"]);
    }

    if(isset($_GET["max"])) {
        $stmt->bindValue(":min", $min, PDO::PARAM_INT);
        $stmt->bindValue(":max", $max, PDO::PARAM_INT);
    }

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