<?php

require_once __DIR__ . "/../../scripts/init.php";

use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\AuthorizationFilter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\SearchEngine;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\ExactFilter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\InternalNameDecorator;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\SearchFilter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\TagsFilter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter\FieldSorter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter\SceneSorter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter\SortSelector;

$engine = new SearchEngine($database, "item_index", ["id", "name", "type", "park", "author", "description", "image", "video_id", "scene", "hidden"]);

//Check if the user provided a query
if(isset($_GET["query"])) {
    //Check if the query is an ID
    if(preg_match("/^[A-Za-z0-9_\/\-]{11}$/", $_GET["query"])) {
        $engine->addFilter(new InternalNameDecorator(new ExactFilter("query"), "id"));

        //Search immediately, since ID searches don't use any other filters
        search();
    }else {
        //Otherwise, search using a dynamically selected algorithm
        $allowedMatches = ["name", "description", "visible_content", "tags"];
        $matches = $allowedMatches;

        //Check if the user has defined a custom list of fields to search
        if(isset($_GET["match"])) {
            //If the values are in array form, use them directly, otherwise explode using commas
            $matches = is_array($_GET["match"]) ? $_GET["match"] : explode(",", $_GET["match"]);
        }

        //Validate and remove any matches that are not on the list of allowed matches
        foreach($matches as $index=>$match) {
            if(!in_array($match, $allowedMatches, true)) {
                unset($matches[$index]);
            }
        }

        //Reindex the array
        $matches = array_values($matches);

        //Fallback to default matching if no matches are left
        if(count($matches) == 0) {
            $matches = $allowedMatches;
        }

        $engine->addFilter(new SearchFilter("query", $matches));
    }
}

//Filter results by park, type, and scene, if present
$engine->addFilter(new ExactFilter("park", ["WDW", "DL", "TDL"]));
$engine->addFilter(new ExactFilter("type", ["image", "video", "audio", "text", "date"]));
$engine->addFilter(new ExactFilter("scene", ["In the Park", "Critter Country", "Frontierland", "Briar Patch Store", "Attraction",  "Exterior", "Queue", "Loading Zone", "Lift A", "Briar Patch", "Lift B", "HDYD Exterior", "HDYD Interior", "EGALP Pre-Bees", "EGALP Bees", "EGALP LP", "Final Lift", "ZDDD Exterior", "ZDDD Showboat", "ZDDD Homecoming", "ZDDD Unload", "Photos", "Exit"]));

//Filter by tags, if present
$engine->addFilter(new TagsFilter("tags"));

//Filter hidden results unless the user is authorized
$engine->addFilter(new InternalNameDecorator(new AuthorizationFilter("visibility", 0), "hidden"));

//Dynamically set the sorting algorithm using the sort_by parameter
$nameSorter = new FieldSorter("name", "ASC");
$engine->setSorter(new SortSelector("sort_by", ["name" => $nameSorter, "newest_first" => new FieldSorter("date_added", "DESC"), "oldest_first" => new FieldSorter("date_added", "ASC"), "scene" => new SceneSorter("scene", $nameSorter)], $nameSorter));

if(isset($_GET["max"])) {
    $min = 0;
    $max = intval($_GET["max"]);

    if(isset($_GET["min"])) {
        //If there's a minimum value specified, then add it to the parameters and calculate the difference between the min and max values
        $min = intval($_GET["min"]);

        $min =  $min - 1;
        $max = $max - $min;
    }

    $engine->setMinMax($min, $max);
}

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