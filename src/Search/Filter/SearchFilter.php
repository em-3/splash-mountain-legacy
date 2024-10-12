<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

use Exception;

/**
 * A specialized filter that intelligently searches the database for the provided query string.
 * 
 * This class uses allowed_values as a list of fields in which to search for the query
 */
class SearchFilter extends Filter {

    /** @var FullTextFilter $full_text */
    private $full_text;
    /** @var LikeFilter $like_text */
    private $like_text;

    public function __construct($field_name, $allowed_values) {
        if(!isset($allowed_values)) {
            throw new Exception("SearchFilter requires \$allowed_values to be set!");
        }

        $this->full_text = new FullTextFilter($field_name, $allowed_values);
        $this->like_text = new LikeFilter($field_name, $allowed_values);

        parent::__construct($field_name, $allowed_values);
    }

    public function generateQuery($given_data) {
        //Determine which filter to use
        //'LIKE' filtering is inefficient and should only be used if there is less than one word in the query string
        if(count(explode(" ", $given_data)) > 1) {
            //If there is more than one word, use a full-text search
            return $this->full_text->generateQuery($given_data);
        }else {
            return $this->like_text->generateQuery($given_data);
        }
    }

}

?>