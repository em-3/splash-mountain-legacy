<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

/**
 * Internal class that performs a full text search of provided data
 */
class FullTextFilter extends Filter {

    public function generateQuery($given_data) {
        //Convert allowed_values into a string
        $match_columns = "";
        
        foreach($this->getAllowedValues() as $column) {
            $match_columns .= "`$column`, ";
        }

        //Remove the last comma
        $match_columns = substr($match_columns, 0, -2);

        $sql = "MATCH ($match_columns) AGAINST (:" . $this->getFieldName() . " IN NATURAL LANGUAGE MODE)";

        //Create the SQLSnippet
        return new SQLSnippet($sql, [$this->getFieldName() => $given_data]);
    }

}

?>