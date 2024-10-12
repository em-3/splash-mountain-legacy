<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search;

/**
 * Represents a snippet of SQL with data bindings
 */
class SQLSnippet {

    /** @var string $sql_string */
    private $sql_string;
    /** @var array $data_bindings */
    private $data_bindings;

    public function __construct($sql_string, $data_bindings) {
        $this->sql_string = $sql_string;
        $this->data_bindings = $data_bindings;
    }

    public function getSQLString() {
        return $this->sql_string;
    }

    public function getDataBindings() {
        return $this->data_bindings;
    }

}

?>