<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Search\Filter;

require_once __DIR__ . "/../../../admin/scripts/init_admin.php";

use SplmlFoundation\SplashMountainLegacyBackend\Search\SQLSnippet;

class AuthorizationFilter extends Filter {

    /** @var int $required_clearance */
    private $required_clearance;

    public function __construct($field_name, $required_clearance = 0) {
        $this->required_clearance = $required_clearance;

        parent::__construct($field_name);
    }

    public function defaultQuery() {
        return "`" . $this->getFieldName() . "` = 0";
    }

    public function generateQuery($given_data) {
        $sql = "`" . $this->getFieldName() . "` = 0";

        //If the user is requesting all items, then simply don't return the authentication check query snippet
        if($given_data == "all" && check_authentication() && check_clearance($this->required_clearance)) {
            return false;
        }

        return new SQLSnippet($sql, []);
    }

}

?>