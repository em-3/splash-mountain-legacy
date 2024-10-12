<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\GenericEnginePlugin;

/**
 * An immutable class representing a SQL filter
 */
abstract class Filter extends GenericEnginePlugin {
    
    /** @var string[] $allowed_values */
    private $allowed_values;

    public function __construct($field_name, $allowed_values = []) {
        $this->allowed_values = $allowed_values;

        parent::__construct($field_name);
    }

    protected function getAllowedValues() {
        return $this->allowed_values;
    }

    protected function validateGivenData($given_data) {
        if(count($this->getAllowedValues()) == 0) {
            return;
        }

        $match = false;
        foreach($this->getAllowedValues() as $value) {
            if($given_data == $value) {
                $match = true;
            }
        }

        //Throw an exception if the data doesn't match
        if(!$match) {
            throw new \Exception("Given data for filter (" . $this->getFieldName() . ") did not match any allowed values! Data: " . $given_data);
        }
    }

}

?>