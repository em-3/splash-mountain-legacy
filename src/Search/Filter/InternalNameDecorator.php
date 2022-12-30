<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class InternalNameDecorator extends Filter {

    /** @var Filter $filter */
    private $filter;
    /** @var string $internal_name */
    private $internal_name;

    public function __construct($filter, $internal_name) {
        $this->filter = $filter;
        $this->internal_name = $internal_name;

        parent::__construct($this->filter->getFieldName(), $this->filter->getAllowedValues());
    }

    public function defaultQuery() {
        //Generate the filter's SQL statement
        $snippet = $this->filter->defaultQuery();

        //If the statement returned false, mirror that
        if(!$snippet) {
            return false;
        }

        //Replace field_name with internal_name at all occurrences in the SQL
        return str_replace($this->getFieldName(), $this->internal_name, $snippet);
    }

    public function generateQuery($given_data) {
        //Generate the filter's SQL statement
        $snippet = $this->filter->generateQuery($given_data);

        //If the statement returned false, mirror that
        if(!$snippet) {
            return false;
        }

        //Replace field_name with internal_name at all occurrences in the SQL
        $sql = str_replace($this->getFieldName(), $this->internal_name, $snippet->getSQLString());

        //Replace field_name with internal_name in the data
        $data = [];

        foreach($snippet->getDataBindings() as $data_binding) {
            $data[$this->internal_name] = $data_binding;
        }

        //Create the SQLSnippet
        return new SQLSnippet($sql, $data);
    }

}

?>