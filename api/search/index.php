<?php

require_once __DIR__ . "/../../scripts/init.php";

$available_params = ["type", "format", "park"];
$params = array();
$results;
$stmt = "SELECT * FROM `item_index` WHERE";

if(isset($_GET["query"])) {
    $query = rawurldecode($_GET["query"]);

    //Add the query to the list of parameters
    $params["query"] = $query;

    $stmt .= " MATCH ( name, author, description ) AGAINST ( :query IN BOOLEAN MODE )";
}

foreach($available_params as $param) {
    //Check if the parameter was set
    if(isset($_GET[$param])) {
        //If there is more than one parameter, add an AND
        if(count($params) > 0) {
            $stmt .= " AND";
        }

        //Set the parameter's value
        $params[$param] = $_GET[$param];

        //Add the parameter to the statement
        $stmt .= " `$param` = :$param";
    }
}

if(isset($_GET["max"])) {
    $max = intval($_GET["max"]);

    if(isset($_GET["min"])) {
        //If there's a minimum value specified, then add it to the parameters and calculate the difference between the min and max values
        $min = $_GET["min"];

        $params["min"] = intval($min) - 1;
        $params["max"] = intval($max) - $min;
    }else {
        //Otherwise just add zero and the max value
        $params["min"] = 0;
        $params["max"] = $max;
    }

    //Update the statement to include the min and max
    $stmt .= " LIMIT ?, ?";
}

//Prepare the statement
$stmt = $database->prepare($stmt);

foreach($params as $param=>$param_value) {
    if(is_int($param_value)) {
        $stmt->bindValue($param, $param_value, PDO::PARAM_INT);
    }else {
        $stmt->bindValue($param, $param_value, PDO::PARAM_STR);
    }
}

//Execute the statement
$stmt->execute();

//Convert the results to JSON and ouput them
header("Content-Type: application/json");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

?>