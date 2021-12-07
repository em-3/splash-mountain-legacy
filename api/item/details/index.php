<?php

require_once __DIR__ . "/../../../scripts/init.php";

$stmt = "SELECT * FROM `item_index` WHERE `id` = ?";
$params = array();

$id = rawurldecode($_GET["id"]);

//Add the ID to the list of parameters
array_push($params, "\"$id\"");

//Prepare the statement
$stmt = $database->prepare($stmt);

foreach($params as $index=>$param) {
    if(is_int($param)) {
        $stmt->bindValue($index + 1, $param, PDO::PARAM_INT);
    }else {
        $stmt->bindValue($index + 1, $param, PDO::PARAM_STR);
    }
}

//Execute the statement
$stmt->execute();

//Convert the results to JSON and ouput them
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

?>