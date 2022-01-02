<?php

require_once __DIR__ . "/../../scripts/init.php";

$available_params = ["type", "park"];
$params = array();
$id_only = false;
$results;
$stmt = "SELECT * FROM `item_index`";

if(isset($_GET["query"])) {
    $query = rawurldecode($_GET["query"]);

    if(preg_match("/[A-Za-z0-9\/]{11}/", $query)) {
        //Add the query to the list of parameters
        $params["id"] = $query;
        
        //If the query is a valid item ID, return only that item
        $id_only = true;
        $stmt .= "WHERE `id` = :id";
    }else {
        //Format the query and add it to the parameters
        $params["query"] = "%" . $query . "%";

        //Search for the query in name, author, and description fields
        $stmt .= " WHERE (`name` LIKE :query OR `author` LIKE :query OR `description` LIKE :query)";
    }
}

//If id only mode is enabled, then ignore all other parameters
if(!$id_only) {

    foreach($available_params as $param) {
        //Check if the parameter was set
        if(isset($_GET[$param])) {
            //If there is more than one parameter, add an AND
            if(count($params) > 0) {
                $stmt .= " AND";
            }else {
                $stmt .= " WHERE";
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
            $min = intval($_GET["min"]);

            $params["min"] = $min - 1;
            $params["max"] = $max - $min;
        }else {
            //Otherwise just add zero and the max value
            $params["min"] = 0;
            $params["max"] = $max;
        }

        //Update the statement to include the min and max
        $stmt .= " LIMIT :min, :max";
    }

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