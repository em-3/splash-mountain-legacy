<?php

namespace SplmlFoundation\SplashMountainLegacyBackend;

class DatabaseEntry {

    private $id;
    private $required_fields;
    private $optional_fields;
    private $field_values = array();
    private $database;
    private $table_name;
    private $ready_status = false;

    /**
     * DatabaseEntry constructor.
     * @param int $id The id of the entry.
     * @param array $required_fields The required fields of the entry.
     * @param array $optional_fields The optional fields of the entry.
     * @param PDO $database The database to use.
     * @param string $table_name The name of the table to use.
     */
    public function __construct($database, $table_name, $required_fields = array(), $optional_fields = array(), $id = null) {
        $this->id = $id;
        $this->required_fields = $required_fields;
        $this->optional_fields = $optional_fields;
        $this->database = $database;
        $this->table_name = $table_name;
    }

    /**
     * Loads data into the entry from an array containing the required and optional fields.
     * @param array $data The data to load into the entry.
     * @throws \Exception If required fields are missing.
     */
    public function loadData($data) {
        //Check if this entry is an existing entry.
        if(isset($this->id)) {
            $fields = array_merge($this->required_fields, $this->optional_fields);

            //Loop through each of the fields and add them if they are allowed to be modified.
            foreach($fields as $field) {
                if(isset($data[$field])) {
                    if(is_numeric($data[$field])) {
                        $this->field_values[$field] = intval($data[$field]);
                    }else {
                        $this->field_values[$field] = $data[$field];
                    }
                }
            }

            if(count($this->field_values) <= 0) {
                throw new \Exception("No fields were set to be updated.");
            }
        }else {
            //Loop through the required fields and check if they are present.
            foreach ($this->required_fields as $field) {
                if (!isset($data[$field])) {
                    //Throw an exception if a required field is missing.
                    throw new \Exception("Missing required field: $field");
                }

                if(is_numeric($data[$field])) {
                    $this->field_values[$field] = intval($data[$field]);
                }else {
                    $this->field_values[$field] = $data[$field];
                }
            }

            //Loop through the optional fields and add them to the field values if they are present.
            foreach ($this->optional_fields as $field) {
                if(is_numeric($data[$field])) {
                    $this->field_values[$field] = intval($data[$field]);
                }else {
                    $this->field_values[$field] = $data[$field];
                }
            }
        }

        //Set the ready status to true.
        $this->ready_status = true;
    }

    /**
     * Saves the entry to the database, or updates it if it already exists.
     * @return string The id of the entry, if it was saved.
     * @throws \Exception If the entry is not valid, or if the save fails.
     */
    public function saveEntry() {
        //Check if the entry is ready.
        if (!$this->ready_status) {
            throw new \Exception("Entry is not ready. Please load data first.");
        }

        if(isset($this->id)) {
            //Update the entry if it already exists.
            return $this->updateEntry();
        } else {
            //Insert the entry if it doesn't exist.
            return $this->createEntry();
        }
    }

    /**
     * Deletes the entry from the database.
     * @return bool True if the entry was deleted, false if it didn't exist.
     * @throws \Exception If the entry is not valid, or if the delete fails.
     */
    public function deleteEntry() {
        if(!isset($this->id)) {
            throw new \Exception("Entry is not valid. No id set.");
        }

        //Check if the item exists in the database
        $stmt = $this->database->prepare("SELECT * FROM `$this->table_name` WHERE `id` = ?");
        $stmt->bindValue(1, $this->id);
        $stmt->execute();

        if($stmt->rowCount() == 0) {
            return false;
        }

        //Delete the entry from the database.
        $query = "DELETE FROM $this->table_name WHERE id = :id";

        $statement = $this->database->prepare($query);
        $statement->bindParam(":id", $this->id);

        //Execute the query.
        $statement->execute();

        //Check if the entry was deleted.
        return $statement->rowCount() == 1;
    }

    /**
     * Updates the entry in the database.
     * @return string The id of the entry, if it was updated.
     * @throws \Exception If the entry is not valid, or if the update fails.
     */
    private function updateEntry() {
        if(!isset($this->id)) {
            throw new \Exception("Entry does not have an id.");
        }

        //Create the query
        $query = "UPDATE $this->table_name SET ";

        //Loop through the field values and add them to the query.
        foreach ($this->field_values as $field => $value) {
            $query .= "$field = :$field, ";
        }

        //Remove the trailing comma and space.
        $query = substr($query, 0, -2);

        //Add the id to the query.
        $query .= " WHERE id = :id";

        //Prepare the query.
        $statement = $this->database->prepare($query);

        //Bind the values to the query.
        foreach($this->field_values as $field => $value) {
            $statement->bindValue(":$field", $value);
        }

        //Bind the id to the query.
        $statement->bindValue(":id", $this->id, \PDO::PARAM_STR);

        //Execute the query.
        $statement->execute();

        //Check if the query was successful.
        if($statement->rowCount() == 0) {
            throw new \Exception("Update to entry ($this->id) failed. Query: $query");
        }

        //Return the id of the entry.
        return $this->id;
    }

    /**
     * Creates a new entry in the database with the given data.
     * @return int The id of the new entry.
     * @throws \Exception If the entry already exists, or if the creation fails.
     */
    private function createEntry() {
        if(isset($this->id)) {
            //Throw an exception if the entry already exists.
            throw new \Exception("Entry already exists.");
        }

        $id = $this->generateID();

        //Create the query.
        $query = "INSERT INTO $this->table_name (id, ";

        //Loop through the set fields and add them to the query.
        foreach($this->field_values as $field => $value) {
            $query .= "$field, ";
        }

        //Remove the trailing comma and space.
        $query = substr($query, 0, -2);

        //Add the values to the query.
        $query .= ") VALUES ('$id', ";

        foreach($this->field_values as $field => $value) {
            $query .= ":$field, ";
        }

        //Remove the trailing comma and space.
        $query = substr($query, 0, -2);

        $query .= ")";

        //Add the values to the query.
        $statement = $this->database->prepare($query);

        foreach($this->field_values as $field => $value) {
            $statement->bindValue(":$field", $value);
        }

        //Execute the query.
        $statement->execute();

        //Check if query was sucessful.
        if($statement->rowCount() == 0) {
            throw new \Exception("Failed to create entry. Query: $query");
        }

        return $id;
    }

    /**
     * Generates a random unique Base38 URL ID.
     * @return string The random Base38 URL ID
     * @throws Exception If the ID could not be generated
     */
    function generateID() {
        $index = "abcdefghijklmnopqrstuvwxyz0123456789-_";

        for($i = 0; $i < 100; $i++) {

            //Generate an id
            $id = "";
            for($i = 0; $i < 11; $i++) {
                $id .= $index[mt_rand(0, 37)];
            }

            //Check if the ID is unique
            $stmt = $this->database->prepare("SELECT * FROM `$this->table_name` WHERE `id` = ?");
            $stmt->bindValue(1, $id);
            $stmt->execute();
            
            //If the result set is empty, then the ID is unique
            if($stmt->rowCount() == 0) {
                return $id;
            }
        }

        throw new \Exception("Failed to generate unique ID");
    }

}