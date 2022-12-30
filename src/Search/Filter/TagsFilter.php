<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class TagsFilter extends Filter {

    public function generateQuery($given_data) {
        //The following code was copied from LikeFilter.php, with the OR changed to AND
        $sql = "";
        $data = [];

        $tags = explode(",", $given_data);

        foreach($tags as $index=>$tag) {
            $id = $index . $this->getFieldName();
            $sql .= $this->getFieldName() . " LIKE :" . $id . " AND ";
            $data[$id] = "%" . $given_data . "%";
        }

        $sql = substr($sql, 0, -4);

        //Create the SQLSnippet
        return new SQLSnippet($sql, $data);
    }

}

?>