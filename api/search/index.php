<!--
    api/search/index.php
    Copyright 2021 EM_3
    All rights reserved
-->
<?php

require_once __DIR__ . "/../../scripts/init.php";

//We need to make sure at least query, type, or park is set
$stmt = "SELECT * FROM `item_index` WHERE";
$params = array();
$results;

if(isset($_GET["query"])) {
    $query = rawurldecode($_GET["query"]);

    //Add the query to the list of parameters
    array_push($params, "\"$query\"");

    //Update the statement to include the query
    $stmt .= " MATCH ( name, author, description ) AGAINST ( ? IN BOOLEAN MODE )";
}

if(isset($_GET["type"])) {
    if(count($params) > 0) {
        $stmt .= " AND";
    }

    //Add the type to the list of parameters
    array_push($params, $_GET["type"]);

    //Update the statement to include the type
    $stmt .= " type = ?";
}

if(isset($_GET["park"])) {
    if(count($params) > 0) {
        $stmt .= " AND";
    }

    //Add the park to the list of parameters
    array_push($params, $_GET["park"] );

    //Update the statement to include the park
    $stmt .= " park = ?";
}

if(isset($_GET["max"])) {
    $max = intval($_GET["max"]);

    if(isset($_GET["min"])) {
        //If there's a minimum value specified, then add it to the parameters and calculate the difference between the min and max values
        $min = $_GET["min"];

        array_push($params, intval($min) - 1);
        array_push($params, intval($max) - $min);
    }else {
        //Otherwise just add zero and the max value
        array_push($params, 0);
        array_push($params, $max);
    }

    //Update the statement to include the min and max
    $stmt .= " LIMIT ?, ?";
}

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