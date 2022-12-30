<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class ExactInternalNameFilter extends Filter {

    /** @var string $internal_name */
    private $internal_name;

    public function __construct($field_name, $internal_name, $allowed_values = []) {
        $this->internal_name = $internal_name;

        parent::__construct($field_name, $allowed_values);
    }

    public function generateQuery($given_data) {
        //Check if the given data matches the allowed values
        $this->validateGivenData($given_data);

        //The data must exactly equal this value
        $sql = "`" . $this->internal_name . "` = :" . $this->internal_name;

        //Create the SQLSnippet
        return new SQLSnippet($sql, [$this->internal_name => $given_data]);
    }

}

?>