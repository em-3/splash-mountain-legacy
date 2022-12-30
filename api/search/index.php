<?php

require_once __DIR__ . "/../../scripts/init.php";

use SplmlFoundation\SplashMountainLegacyBackend\Search\SearchEngine;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\ExactFilter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\ExactInternalNameFilter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\SearchFilter;

$engine = new SearchEngine($database, "item_index", ["id", "name", "type", "park", "author", "description", "image", "video_id", "scene", "hidden"]);

//Check if the user provided a query
if(isset($_GET["query"])) {
    //Check if the query is an ID
    if(preg_match("/^[A-Za-z0-9_\/]{11}$/", $_GET["query"])) {
        $engine->addFilter(new ExactInternalNameFilter("query", "id"));

        //Search immediately, since ID searches don't use any other filters
        search();
    }else {
        //Otherwise, search using a dynamically selected algorithm
        $engine->addFilter(new SearchFilter("query", ["name", "description", "visible_content", "tags"]));
    }
}

//Filter results by park, type, and scene, if present
$engine->addFilter(new ExactFilter("park", ["WDW", "DL", "TDL"]));
$engine->addFilter(new ExactFilter("type", ["image", "video", "audio", "text", "date"]));
$engine->addFilter(new ExactFilter("scene", ["In the Park", "Critter Country", "Frontierland", "Briar Patch Store", "Attraction",  "Exterior", "Queue", "Loading Zone", "Lift A", "Briar Patch", "Lift B", "HDYD Exterior", "HDYD Interior", "EGALP Pre-Bees", "EGALP Bees", "EGALP LP", "Final Lift", "ZDDD Exterior", "ZDDD Showboat", "ZDDD Homecoming", "ZDDD Unload", "Photos", "Exit"]));

//Filter by tags, if present
// $engine->addFilter(new TagsFilter("tags"));

//Filter hidden results unless the user is authorized
// $engine->addFilter(new ExactFieldDecorator(new AuthorizationFilter("visibility", 0), "hidden"));

//Dynamically set the sorting algorithm using the sort_by parameter
// $engine->setSorter(new SortSelector("sort_by"));

search();

function search() {
    global $engine;

    try {
        //Search the database using the provided filters
        $results = $engine->performSearch($_GET);
    
        header("Content-Type: application/json");
        exit(json_encode(["status" => "success", "search_results" => $results]));
    }catch(Exception $e) {
        header("Content-Type: application/json");
        die(json_encode(["status" => "error", "error" => $e->getMessage()]));
    }
}

?>