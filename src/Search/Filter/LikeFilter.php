<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

/**
 * Internal class that performs a LIKE text search of provided data
 */
class LikeFilter extends Filter {

    public function generateQuery($given_data) {
        $sql = "";

        foreach($this->getAllowedValues() as $column) {
            $sql .= "$column LIKE :" . $this->getFieldName() . " OR ";
        }

        $sql = substr($sql, 0, -4);

        //Create the SQLSnippet
        return new SQLSnippet($sql, [$this->getFieldName() => "%" . $given_data . "%"]);
    }

}

?>