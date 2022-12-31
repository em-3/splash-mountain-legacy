<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search;

use SplmlFoundation\SplashMountainLegacyBackend\Search\Filter\Filter;
use SplmlFoundation\SplashMountainLegacyBackend\Search\Sorter\Sorter;

class SearchEngine {

    /** @var \PDO $database */
    private $database;
    /** @var string $table_name */
    private $table_name;
    /** @var string[] $requested_fields */
    private $requested_fields;

    /** @var Filter[] $filters */
    private $filters;
    /** @var Sorter $sorter */
    private $sorter;

    public function __construct($database, $table_name, $requested_fields) {
        $this->database = $database;
        $this->table_name = $table_name;
        $this->requested_fields = $requested_fields;
        $this->filters = array();
    }

    /**
     * Adds a filter to this engine
     * 
     * @param Filter $filter The filter to add
     */
    public function addFilter($filter) {
        array_push($this->filters, $filter);
    }

    /**
     * Sets the sorter to be used by this engine
     * 
     * @param Sorter $sorter The sorter that this engine will use
     */
    public function setSorter($sorter) {
        $this->sorter = $sorter;
    }

    /**
     * Searches the database, using the currently configured filters and sorters
     * 
     * @param string[] $search_parameters An associative array containing the parameters to search against
     */
    public function performSearch($search_parameters) {
        //Generate the first part of the query
        $sql = "SELECT ";

        //Add the requested fields
        foreach($this->requested_fields as $field) {
            $sql .= "`$field`, ";
        }

        //Remove the last comma
        $sql = substr($sql, 0, -2);

        $sql .= " FROM " . $this->table_name;

        //Build a list of field names
        $field_names = array_map(function($filter) {
            return $filter->getFieldName();
        }, $this->filters);

        $data_bindings = array();

        $first = true;

        foreach($this->filters as $filter) {
            //Check if the filter is present in the search data
            if(!array_key_exists($filter->getFieldName(), $search_parameters)) {
                //If it is not, run the default hook
                $snippet = $filter->defaultQuery();

                if(!$snippet) {
                    continue;
                }
                    
                //Add an AND if this is not the first value
                if(!$first) {
                    $sql .= " AND ";
                }else {
                    $sql .= " WHERE ";
                    $first = false;
                }

                //Concatenate the snippet onto the query
                $sql .= "($snippet)";

                continue;
            }

            //Request the query from each filter
            $snippet = $filter->generateQuery($search_parameters[$filter->getFieldName()]);

            if(!$snippet) {
                continue;
            }

            //Add an AND if this is not the first value
            if(!$first) {
                $sql .= " AND ";
            }else {
                $sql .= " WHERE ";
                $first = false;
            }

            //Add the data bindings to the global array
            $data_bindings = array_merge($data_bindings, $snippet->getDataBindings());

            //Concatenate the snippet to the query
            $sql .= "(" . $snippet->getSQLString() . ")";
        }

        if(isset($this->sorter)) {
            $sql .= " ORDER BY ";

            //If the sorter's specified query is not defined, then execute its default behavior
            if(!array_key_exists($this->sorter->getFieldName(), $search_parameters)) {
                $snippet = $this->sorter->defaultQuery();

                if($snippet != false) {
                    $sql .= $snippet;
                }
            }else {
                //Request that the sorter generate the query
                $snippet = $this->sorter->generateQuery($search_parameters[$this->sorter->getFieldName()]);

                if($snippet != false) {
                    $sql .= $snippet->getSQLString();

                    //Add the data bindings to the global array
                    $data_bindings = array_merge($data_bindings, $snippet->getDataBindings());
                }
            }
        }

        //Execute the query
        $statement = $this->database->prepare($sql);
        $statement->execute($data_bindings);

        return $statement->fetchAll(\PDO::FETCH_ASSOC);
    }

}

?>