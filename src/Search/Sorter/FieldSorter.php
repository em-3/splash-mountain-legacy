<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class FieldSorter extends Sorter {

    /** @var string $sort_direction */
    private $sort_direction;

    public function __construct($field_name, $sort_direction) {
        $this->sort_direction = $sort_direction;

        parent::__construct($field_name);
    }

    public function generateQuery($given_data) {
        $sql = "`" . $this->getFieldName() . "` " . $this->sort_direction;

        return new SQLSnippet($sql, []);
    }

}

?>