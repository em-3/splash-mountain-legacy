<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Entry;

use SplmlFoundation\SplashMountainLegacyBackend\Logging\AuditLog;

class ItemEntry extends Entry {

    /** @var AuditLog $audit_log */
    private $audit_log;

    public function __construct($database, $table_name, $id) {
        parent::__construct($database, $table_name, $id);
        $this->audit_log = new AuditLog($database, "audit_log", "item");
    }

    protected function handleDataPut(&$field, &$data) {
        //Check if the tags field is currently being put
        if($field == "tags" && is_array($data)) {
            //Collapse the array into a string
            $data = implode(", ", $data);
        }
    }

    protected function handleEntryCreate($data) {
        $this->audit_log->logAuditAction("create", $this->getID(), $_SESSION["id"], $data);
    }

    protected function handleEntryDelete() {
        $this->audit_log->logAuditAction("delete", $this->getID(), $_SESSION["id"]);
    }

    protected function handleEntryUpdate($data) {
        $this->audit_log->logAuditAction("modify", $this->getID(), $_SESSION["id"], $data);
    }

    public static function getRequiredFields() {
        return ["name", "type", "park", "description"];
    }

    public static function getOptionalFields() {
        return ["author", "video_id", "image", "source", "scene", "metadata", "tags", "timestamp", "hidden"];
    }

    public static function getModifiableFields() {
        return ["name", "park", "description", "author", "video_id", "image", "source", "scene", "metadata", "tags", "timestamp", "hidden"];
    }

}

?>