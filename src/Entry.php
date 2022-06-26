<?php

namespace SplmlFoundation\SplashMountainLegacyBackend;

abstract class Entry {

    /** @var \PDO $database */
    private $database;
    /** @var string $table_name */
    private $table_name;
    /** @var string $id */
    private $id;
    /** @var array $data */
    private $data;
    /** @var bool $ready */
    private $ready = false;

    public function __construct($database, $table_name, $id) {
        $this->database = $database;
        $this->table_name = $table_name;
        $this->id = $id;
    }

    /**
     * Sets a specific field for this entry
     * @param string $fieldName The name of the field to set
     * @param mixed $fieldValue The value of the field to set
     * @throws \Exception If the field name provided is not a known field name
     */
    public function setDataField($fieldName, $fieldValue) {
        //Check if the field exists
        if(!in_array($fieldName, $this::getFields())) {
            throw new \Exception("Field ($fieldName) doesn't exist for this entry");
        }

        $data[$fieldName] = $fieldValue;
    }

    /**
     * Inserts all matching required parameters into their correct fields. Any non-required fields are ignored
     * @param array $input An associative array containing all required fields as defined in `getRequiredFields()`
     * @throws \Exception If a required field is missing from the input array
     */
    public function putRequiredData($input) {
        $required_fields = $this::getRequiredFields();

        foreach($required_fields as $field) {
            if(!in_array($field, $input)) {
                throw new \Exception("Missing required field ($field)");
            }

            $data[$field] = $input[$field];
        }

        $this->ready = true;
    }

    /**
     * Inserts all matching optional parameters into their correct fields. Any non-optional fields are ignored
     * @param array $input An associative array containing all optional fields as defined in `getOptionalFields()`
     */
    public function putOptionalData($input) {
        $optional_fields = $this::getOptionalFields();

        foreach($optional_fields as $field) {
            if(in_array($field, $input)) {
                $data[$field] = $input[$field];
            }
        }
    }

    /**
     * Commits the current item state to the database
     * @param bool $transaction Whether or not to start a database transaction. If set, any errors occurring during entry creation will cause the database to rollback to its previous state.
     * @throws \Exception If an error occurs during the commit
     */
    public function commit($transaction = false) {
        //Ensure that the entry is ready
        if(!$this->ready) {
            throw new \Exception("All required fields have not been set on this entry");
        }

        try {
            if($transaction) {
                $this->database->beginTransaction();
            }

            //Create the insert statement
            $sql = "INSERT INTO " . $this->table_name . " (";

            //Add the keys
            foreach($this->data as $key=>$value) {
                $sql .= $key . ", ";
            }

            //Remove the last comma
            $sql = substr($sql, 0, -2);
            
            //Add the values
            $sql .= ") VALUES (";

            for($i = 0; $i < count($this->data); $i++) {
                $sql .= "?, ";
            }

            //Remove the last comma
            $sql = substr($sql, 0, -2);

            //Prepare and execute the query
            $stmt = $this->database->prepare($sql);
            $stmt->execute(array_values($this->data));

            if($stmt->rowCount !== 1) {
                throw new \Exception("Failed to commit data");
            }

            if($transaction) {
                $this->database->commit();
            }
        }catch(\Exception $e) {
            if($transaction) {
                $this->database->rollBack();
            }
        }
    }

    /**
     * Returns this entry's ID
     */
    public function getID() {
        return $this->id;
    }

    /**
     * Returns the list of available fields for this entry.
     * @return array The available fields for this entry
     */
    public static function getFields() {
        //Just concatenate the required and optional fields
        return array_merge(static::getRequiredFields(), static::getOptionalFields());
    }

    /**
     * Returns the list of required fields for this entry
     * @return array The required fields for this entry
     */
    public static abstract function getRequiredFields();

    /**
     * Returns the list of optional fields for this entry
     * @return array The optional fields for this entry
     */
    public static abstract function getOptionalFields();

}

?>