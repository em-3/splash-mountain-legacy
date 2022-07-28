<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Logging;

class AuditLog {

    /** @var \PDO $database */
    private $database;
    /** @var string $table_name */
    private $table_name;
    /** @var string $type */
    private $type;

    public function __construct($database, $table_name, $type) {
        $this->database = $database;
        $this->table_name = $table_name;
        $this->type = $type;
    }

    /**
     * Logs a new action in the audit log.
     * @param string $action The type of action that occurred. Must be create, delete, or modify.
     * @param string $entry_id The ID of the entry that the action occurred on.
     * @param string $user_id The ID of the authenticated user that executed the action
     * @param array $changes A list of entry data fields that were changed and their new values
     * @throws \Exception If the audit logs fails to update
     */
    public function logAuditAction($action, $item_id, $user_id, $changes = []) {
        $sql = "INSERT INTO " . $this->table_name . " (timestamp, item_id, type, action, user_id, changes) VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $this->database->prepare($sql);
        $stmt->execute([time(), $item_id, $this->type, $action, $user_id, json_encode($changes)]);

        if($stmt->rowCount() !== 1) {
            throw new \Exception("Could not update audit log. Query: $sql");
        }
    }

}

?>