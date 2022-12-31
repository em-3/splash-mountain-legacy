<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search;

abstract class GenericEnginePlugin {

    /** @var string $field_name */
    private $field_name;

    public function __construct($field_name) {
        $this->field_name = $field_name;
    }

    public function getFieldName() {
        return $this->field_name;
    }

    /**
     * Generates the SQL query for this generator if the generator is not specified in the request
     * 
     * Unlike generateQuery, this function is not provided with data
     * 
     * @return string|false The SQL query snippet for this generator, or false if no SQL was generated
     */
    public function defaultQuery() {
        return false;
    }

    /**
     * Generates the SQL query for this generator
     * 
     * @param string $given_data Data provided by the engine specifying the operating mode of this generator
     * @return SQLSnippet|false The SQL query snippet for this generator, or false if no SQL was generated
     */
    public abstract function generateQuery($given_data);

}

?>