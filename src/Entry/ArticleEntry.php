<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Entry;

use SplmlFoundation\SplashMountainLegacyBackend\Logging\AuditLog;

class ArticleEntry extends Entry {

    /** @var AuditLog $audit_log */
    private $audit_log;

    public function __construct($database, $table_name, $id) {
        parent::__construct($database, $table_name, $id);
        $this->audit_log = new AuditLog($database, "audit_log", "article");
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
        return ["title", "subtitle", "author", "content", "thumbnail"];
    }

    public static function getOptionalFields() {
        return ["publication_timestamp"];
    }

    public static function getModifiableFields() {
        return ["title", "subtitle", "author", "content", "publication_timestamp"];
    }

}

?>