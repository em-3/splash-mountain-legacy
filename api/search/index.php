<?php

require_once __DIR__ . "/../../scripts/init.php";
require_once __DIR__ . "/../../admin/scripts/init_admin.php";

$sort_by = ["name" => "ASC", "timestamp" => "DESC", "newest_first" => "DESC", "oldest_first" => "ASC"];
$available_params = ["type", "park", "scene"];
$params = array();
$id_only = false;
$tag_mode = isset($_GET["tags"]);
$stmt = "SELECT `id`, `name`, `type`, `park`, `author`, `image`, `video_id`, `scene`, `hidden` FROM `item_index`";

if(isset($_GET["query"])) {
    $query = rawurldecode($_GET["query"]);

    if(preg_match("/[A-Za-z0-9-_]{11}/", $query)) {
        //Add the query to the list of parameters
        $params["id"] = $query;
        
        //If the query is a valid item ID, return only that item
        $id_only = true;
        $stmt .= "WHERE `id` = :id";
    }else {
        //Format the query and add it to the parameters
        $params["query"] = "%" . $query . "%";

        //Search for the query in name, author, and description fields
        $stmt .= " WHERE (";

        $matches = ["name", "author", "description", "scene"];

        if(isset($_GET["match"])) {
            $matches = is_array($_GET["match"]) ? $_GET["match"] : explode(",", $_GET["match"]);
        }

        for($i = 0; $i < count($matches); $i++) {
            if($i > 0) {
                $stmt .= " OR ";
            }

            $stmt .= "`" . $matches[$i] . "` LIKE :query";
        }

        //Only search for the query in the tags field if the user has not specified tags as a search parameter
        if(!$tag_mode) {
            $stmt .= " OR (";

            //Add each word to the tags query
            $words = explode(" ", $query);
            for($i = 0; $i < count($words); $i++) {
                if($i > 0) {
                    $stmt .= " AND ";
                }

                $stmt .= "`tags` LIKE :tag" . $i;
                $params["tag" . $i] = "%" . $words[$i] . "%";
            }

            //Close the search query
            $stmt .= ")";
        }

        $stmt .= ")";
    }
}

//If id only mode is enabled, then ignore all other parameters
if(!$id_only) {
    $first = true;

    foreach($available_params as $param) {
        //Check if the parameter was set
        if(isset($_GET[$param])) {
            //If there is more than one parameter, add an AND
            if(count($params) > 0 && $first) {
                $stmt .= " AND (";
                $first = false;
            }else if(count($params) > 0) {
                $stmt .= " AND ";
            }else {
                $stmt .= " WHERE (";
                $first = false;
            }

            //Set the parameter's value
            $params[$param] = $_GET[$param];

            //Add the parameter to the statement
            $stmt .= "`$param` = :$param";
        }
    }

    //If the user has specified tags as a search parameter, add the tags to the statement
    if($tag_mode) {
        //If there is more than one parameter, add an AND
        if(count($params) > 0 && $first) {
            $stmt .= " AND (";
            $first = false;
        }else if(count($params) > 0) {
            $stmt .= " AND ";
        }else {
            $stmt .= " WHERE (";
            $first = false;
        }

        //Add each tag to the statement
        $tags = is_array($_GET["tags"]) ? $_GET["tags"] : explode(",", $_GET["tags"]);
        
        if($tags[0] === "UNTAGGED") {
            $stmt .= "(`tags` IS NULL)";
            $first = false;
            $untaggedMode = true;
        }else {
            for($i = 0; $i < count($tags); $i++) {
                if($i != 0) {
                    $stmt .= " AND ";
                }

                //Add the tag to the statement
                $stmt .= "`tags` LIKE :tag" . $i;
                
                //Add the tag to the parameters
                $params["tag" . $i] = "%" . $tags[$i] . "%";
            }
        }
    }
    
    if(count($params) > 0 && $first) {
        $stmt .= " AND (";
        $first = false;
    }else if(count($params) > 0 || $untaggedMode === true) {
        $stmt .= " AND ";
    }else {
        $stmt .= " WHERE (";
    }

    //Check if the visibility parameter is set
    if(isset($_GET["visibility"]) && in_array($_GET["visibility"], ["private", "all"]) && check_authentication() && check_clearance(0)) {
        //If the visibility is set to all show public items
        if($_GET["visibility"] == "all") {
            $stmt .= "(`hidden` = 0";
        }

        //If the visibility is set to all add an OR clause
        if($_GET["visibility"] == "all") {
            $stmt .= " OR ";
        }else {
            $stmt .= "(";
        }

        $stmt .= "`hidden` = 1";
    }else {
        //Otherwise show only public items
        $stmt .= "(`hidden` = 0";
    }

    $stmt .= ")) ORDER BY ";

    //Sort the results by the specified field
    if(isset($_GET["sort_by"]) && $_GET["sort_by"] == "scene") {
        $stmt .= " " .  <<<EOT
        CASE `scene`
        WHEN "In the Park" THEN 1
        WHEN "Critter Country" THEN 2
        WHEN "Frontierland" THEN 3
        WHEN "Briar Patch Store" THEN 4
        WHEN "Attraction" THEN 5
        WHEN "Exterior" THEN 6
        WHEN "Queue" THEN 7
        WHEN "Loading Zone" THEN 8
        WHEN "Lift A" THEN 9
        WHEN "Briar Patch" THEN 10
        WHEN "Lift B" THEN 11
        WHEN "HDYD Exterior" THEN 12
        WHEN "HDYD Interior" THEN 13
        WHEN "EGALP Pre-Bees" THEN 14
        WHEN "EGALP Bees" THEN 15
        WHEN "EGALP LP" THEN 16
        WHEN "Final Lift" THEN 17
        WHEN "ZDDD Exterior" THEN 18
        WHEN "ZDDD Showboat" THEN 19
        WHEN "ZDDD Homecoming" THEN 20
        WHEN "ZDDD Unload" THEN 21
        WHEN "Photos" THEN 22
        WHEN "Exit" THEN 23
        END
        EOT;
    }else if(isset($_GET["sort_by"]) && (($_GET["sort_by"] == "newest_first") || ($_GET["sort_by"] == "oldest_first"))) {
        $stmt .= "`date_added` " . $sort_by[$_GET["sort_by"]];
    }else if(isset($_GET["sort_by"]) && array_key_exists($_GET["sort_by"], $sort_by)) {
        $stmt .= "`" . $_GET["sort_by"] . "` " . $sort_by[$_GET["sort_by"]];
    }else {
        $stmt .= "`name` ASC";
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

//Convert the results to JSON and output them
header("Content-Type: application/json");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

?>