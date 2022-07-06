<?php

namespace SplmlFoundation\SplashMountainLegacyBackend;

class Resource {

    /** @var \PDO $database */
    private $database;
    /** @var string $table_name */
    private $table_name;
    /** @var string $resource_directory */
    private $resource_directory;
    /** @var array $file */
    private $file;
    /** @var array $associated_ids */
    private $associated_ids;
    /** @var string $id */
    private $id;

    public function __construct($database, $table_name, $resource_directory) {
        $this->database = $database;
        $this->table_name = $table_name;
        $this->setResourceDirectory($resource_directory);
    }

    /**
     * Sets the resource directory to be used
     * @param string $resource_directory The path to the resource directory.
     */
    public function setResourceDirectory($resource_directory) {
        //Check if the directory is null.
        if($resource_directory == null) {
            throw new \Exception("The resource directory cannot be null.");
        }

        //Check if the directory exists.
        if(!is_dir($resource_directory)) {
            throw new \Exception("The resource directory does not exist.");
        }

        //Check if the directory is writable.
        if(!is_writable($resource_directory)) {
            throw new \Exception("The resource directory is not writable.");
        }

        //Check if the directory is readable.
        if(!is_readable($resource_directory)) {
            throw new \Exception("The resource directory is not readable.");
        }

        //If the path is missing a trailing slash, add it.
        if(substr($resource_directory, -1) != "/") {
            $resource_directory .= "/";
        }

        $this->resource_directory = $resource_directory;
    }

    /**
     * Attaches the given uploaded image to this resource
     * @param array $file The file from `$_FILES` to use
     * @throws \Exception If the file is not a valid image
     */
    public function useUploadedImage($file) {
        if(Resource::validateImage($file)) {
            $this->file = $file;
        }
    }

    /**
     * Sets this resource's ID to the provided value
     * If used during resource creation, this may cause instability
     * @param string $id The ID of the resource to use.
     */
    public function useResourceID($id) {
        $this->id = $id;
    }

    /**
     * Loads the associated IDs from the database for this resource.
     * WARNING: This will overwrite the associated IDs in this resource object!
     * @throws \Exception If an error occurs during loading
     */
    public function load() {
        //Create the query to load the associated IDs
        $stmt = $this->database->prepare("SELECT associated_id FROM `" . $this->table_name . "` WHERE resource_id = ?");
        $stmt->execute([$this->getID()]);
        $this->associated_ids = $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * Adds the given entry ID to the list of this resource's associated IDs
     * @param string $id The ID to add
     */
    public function associateID($id) {
        $this->associated_ids[] = $id;
        $this->associated_ids = array_unique($this->associated_ids);
    }

    /**
     * Remove the given entry ID from the list of this resource's associated IDs
     * @param string $id The ID to remove
     * @throws \Exception If the resource does not have the given ID associated with it
     */
    public function dissociateID($id) {
        if(!in_array($id, $this->associated_ids)) {
            throw new \Exception("ID ($id) is not associated with this resource");
        }

        $index = array_search($id, $this->associated_ids);

        array_splice($this->associated_ids, $index, 1);
    }

    /**
     * Gets the ID of this resource
     * @return string The resource's ID
     */
    public function getID() {
        if(isset($this->id)) {
            return $this->id;
        }

        //Generate the hash from the uploaded file's content
        return $this->id = hash_file("sha256", $this->file["tmp_name"]);
    }

    /**
     * Wrapper function for `commit()`, but performs cleanup on the filesystem if the commit fails
     * @throws \Exception If an error occurs during the commit
     */
    public function commitWithCleanup() {
        $filesystem_affected = false;
        try {
            $this->commitChanges($filesystem_affected);
        }catch(\Exception $e) {
            if($filesystem_affected) {
                //Check if the resource was uploaded
                $id = $this->getID();

                $resource_location = $this->resource_directory . "$id";

                //Delete any files that were created
                if(file_exists($resource_location . "/main")) {
                    unlink($resource_location . "/main");
                }

                if(file_exists($resource_location . "/thumbnail")) {
                    unlink($resource_location . "/thumbnail");
                }

                if(file_exists($resource_location)) {
                    rmdir($resource_location);
                }
            }

            throw $e;
        }
    }

    /**
     * Commits the resource to the filesystem and database
     * To avoid corrupted files being left behind if the commit fails, it is recommended to use `commitWithCleanup()` instead.
     * @throws \Exception If an error occurs during the commit
     */
    public function commit() {
        $this->commitChanges();
    }

    protected function performResourceUpload() {
        //Create the image's unique directory
        if(!mkdir($this->resource_directory . $this->getID(), 0777, true)) {
            throw new \Exception("Could not create image directory");
        }

        //Move the image to the directory
        if(!move_uploaded_file($this->file["tmp_name"], $this->resource_directory . $this->getID() . "/main")) {
            throw new \Exception("Could not upload image");
        }
    }

    protected function generateThumbnail() {
        //Convert the image into a GD image
        $image_gd = imagecreatefromstring(file_get_contents($this->resource_directory . $this->getID() . "/main"));

        //Resize the image
        $image_width = imagesx($image_gd);
        $image_height = imagesy($image_gd);

        $thumbnail_width = 256;
        $thumbnail_height = 256;

        if($image_width > $image_height) {
            $thumbnail_height = 256 * $image_height / $image_width;
        }else if($image_width < $image_height) {
            $thumbnail_width = 256 * $image_width / $image_height;
        }

        $thumbnail_gd = imagecreatetruecolor($thumbnail_width, $thumbnail_height);

        if(!$image_gd || !$thumbnail_gd) {
            throw new \Exception("Failed to create GD image");
        }

        //Resample the image
        if(!imagecopyresampled($thumbnail_gd, $image_gd, 0, 0, 0, 0, $thumbnail_width, $thumbnail_height, $image_width, $image_height)) {
            throw new \Exception("Failed to resize image");
        }

        //Save the thumbnail
        if(!imagejpeg($thumbnail_gd, $this->resource_directory . $this->getID() . "/thumbnail")) {
            throw new \Exception("Failed to save thumbnail");
        }
    }

    protected function commitChanges(&$filesystem_affected = null) {
        //Set new associations to all associations
        $new_associations = $this->associated_ids;
        //Get the file hash
        $id = $this->getID();

        //Check if that hash already has any associations
        $stmt = $this->database->prepare("SELECT associated_id FROM `" . $this->table_name . "` WHERE resource_id = ?");
        $stmt->execute([$id]);
        $associated_ids = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        if(count($associated_ids) === 0) {
            //If it doesn't, check to make sure there is at least one association
            if(count($new_associations) === 0) {
                throw new \Exception("There are no entries associated with ID ($id)");
            }
            //Mark the filesystem as affected
            $filesystem_affected = true;
            //Upload the image
            $this->performResourceUpload();
            //Generate a thumbnail from that image
            $this->generateThumbnail();
        }else {
            //If it does, use the list of existing associations to determine what changes must be made
            $associated_ids_to_delete = array_diff($associated_ids, $this->associated_ids);
            $new_associations = array_diff($this->associated_ids, $associated_ids);
            //Create a query to delete any marked associations
            $stmt = $this->database->prepare("DELETE FROM `" . $this->table_name . "` WHERE resource_id = ? AND associated_id = ?");
            //Loop through each association and delete it
            foreach($associated_ids_to_delete as $aid) {
                $stmt->execute([$id, $aid]);
                if($stmt->rowCount() === 0) {
                    throw new \Exception("Associated ID ($aid) for ID ($id) could not be deleted");
                }
            }

            //Check if there is any associations left
            if(count($this->associated_ids) === 0) {
                //If there are not, then delete the resource
                $resource_location = $this->resource_directory . "$id";

                //Delete any files that were created
                if(file_exists($resource_location . "/main")) {
                    unlink($resource_location . "/main");
                }

                if(file_exists($resource_location . "/thumbnail")) {
                    unlink($resource_location . "/thumbnail");
                }

                if(file_exists($resource_location)) {
                    rmdir($resource_location);
                }
            }
        }

        //Finally create a query to add any new changes in the database
        $stmt = $this->database->prepare("INSERT INTO `" . $this->table_name . "` (resource_id, associated_id) VALUES (?, ?)");
        //Loop through each association and add it
        foreach($new_associations as $aid) {
            $stmt->execute([$id, $aid]);
            if($stmt->rowCount() === 0) {
                throw new \Exception("Associated ID ($aid) for ID ($id) could not be added");
            }
        }
    }

    /**
     * Validates an uploaded image
     * @param $file A file from `$_FILES`
     * @return bool `true` if the image is valid, false otherwise
     */
    public static final function validateImage($file) {
        //Check if the file is over 10 MB
        if($file["size"] > 10485760) {
            return false;
        }

        //Check if the file is a png, jpeg, or gif
        $extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        if($extension != "png" && $extension != "jpeg" && $extension != "jpg" && $extension != "gif") {
            return false;
        }

        return true;
    }

}

?>