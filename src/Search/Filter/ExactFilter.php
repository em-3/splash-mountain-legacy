<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class ExactFilter extends Filter {

    public function generateQuery($given_data) {
        //Check if the given data matches the allowed values
        $this->validateGivenData($given_data);

        //The data must exactly equal this value
        $sql = "`" . $this->getFieldName() . "` = :" . $this->getFieldName();

        //Create the SQLSnippet
        return new SQLSnippet($sql, [$this->getFieldName() => $given_data]);
    }

}

?>