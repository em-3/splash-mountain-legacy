<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter;

class SortSelector extends Sorter {

    /** @var Sorter[] $sorters */
    private $sorters;
    /** @var Sorter $default_sorter */
    private $default_sorter;

    public function __construct($field_name, $sorters, $default_sorter = null) {
        $this->sorters = $sorters;
        $this->default_sorter = $default_sorter;

        parent::__construct($field_name);
    }

    public function defaultQuery() {
        return $this->default_sorter->generateQuery(null)->getSQLString();
    }

    public function generateQuery($given_data) {
        //If there is no sorter defined for the given value, then fallback to default sorting
        if(!array_key_exists($given_data, $this->sorters)) {
            return $this->default_sorter->generateQuery($given_data);
        }

        //Otherwise query the correct sorter
        return $this->sorters[$given_data]->generateQuery($given_data);
    }

}

?>