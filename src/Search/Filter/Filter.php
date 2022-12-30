<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

/**
 * An immutable class representing a SQL filter
 */
abstract class Filter {

    /** @var string $field_name */
    private $field_name;
    /** @var string[] $allowed_values */
    private $allowed_values;

    public function __construct($field_name, $allowed_values = []) {
        $this->field_name = $field_name;
        $this->allowed_values = $allowed_values;
    }

    public function getFieldName() {
        return $this->field_name;
    }

    protected function getAllowedValues() {
        return $this->allowed_values;
    }

    protected function validateGivenData($given_data) {
        $match = false;
        foreach($this->getAllowedValues() as $value) {
            if($given_data == $value) {
                $match = true;
            }
        }

        return $match;
    }

    /**
     * Generates the SQL query for this filter
     * 
     * @param string $given_data Data provided by the engine specifying the operating mode of this filter
     * @return SQLSnippet The SQL query snippet for this filter
     */
    public abstract function generateQuery($given_data);

}

?>