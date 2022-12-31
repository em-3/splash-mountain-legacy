<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\GenericEnginePlugin;

abstract class Sorter extends GenericEnginePlugin {

    public function __construct($field_name) {
        parent::__construct($field_name);
    }

    /**
     * Generates the SQL query for this sorter if the sorter is not specified in the request
     * 
     * Unlike generateQuery, this function is not provided with data
     * 
     * @return string|false The SQL query snippet for this sorter, or false if no SQL was generated
     */
    public function defaultQuery() {
        return false;
    }

}

?>