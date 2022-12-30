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

    /**
     * Generates the SQL query for this filter if the filter is not specified in the request
     * 
     * Unlike generateQuery, this function is not provided with data
     * 
     * @return string|false The SQL query snippet for this filter, or false if no SQL was generated
     */
    public function defaultQuery() {
        return false;
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
            throw new \Exception("Given data for exact filter (" . $this->getFieldName() . ") did not match any allowed values! Data: " . $given_data);
        }
    }

    /**
     * Generates the SQL query for this filter
     * 
     * @param string $given_data Data provided by the engine specifying the operating mode of this filter
     * @return SQLSnippet|false The SQL query snippet for this filter, or false if no SQL was generated
     */
    public abstract function generateQuery($given_data);

}

?>