<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class SceneSorter extends Sorter {

    /** @var Sorter $fallback_sorter */
    private $fallback_sorter;

    public function __construct($field_name, $fallback_sorter) {
        $this->fallback_sorter = $fallback_sorter;

        parent::__construct($field_name);
    }

    public function generateQuery($given_data) {
        $sql = "CASE `" . $this->getFieldName() . "` " . <<<EOT
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

        $fallback = $this->fallback_sorter->generateQuery($given_data);

        $data = [];

        if($fallback != false) {
            $sql .= ", " . $fallback->getSQLString();
            $data = $fallback->getDataBindings();
        }

        return new SQLSnippet($sql, $data);
    }

}

?>