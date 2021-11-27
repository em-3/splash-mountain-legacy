<?php
namespace SplmlFoundation\SplashMountainLegacyBackend;

/**
 * Represents a resource that can be loaded or modified via the endpoint.
 */
class Resource {

    private $resource_path;

    private $resource_id;
    private $resource_config;
    private $resource_data;

    public function __construct($resource_id, $resource_path = __DIR__ . "/resources/", $resource_config = null, $resource_data = null) {
        $this->resource_path = $resource_path;
        $this->resource_id = $resource_id;
        $this->resource_config = $resource_config;
        $this->resource_data = $resource_data;
    }

    /**
     * Checks if this resource exists.
     */
    public function exists() {
        return is_dir($this->resource_path . $this->resource_id);
    }

    /**
     * Loads the resource's configuration. If the resource doesn't exist or the config is already loaded, an exception is thrown.
     */
    public function load_config() {
        if (!$this->exists()) {
            throw new \Exception("Resource '$this->resource_id' does not exist.");
        }else if($this->resource_config != null) {
            throw new \Exception("Resource '$this->resource_id' config already loaded.");
        }
        $this->resource_config = json_decode(file_get_contents($this->resource_path . $this->resource_id . "/config.json"));
    }

    public function get_config() {
        if(!isset($this->resource_config)) {
            $this->load_config();
        }
        return $this->resource_config;
    }

    /**
     * Returns the mime type of the resource.
     */
    public function get_mime_type() {
        return $this->get_config()->mime_type;
    }

    /**
     * Returns the resource's raw data.
     */
    public function get_data() {
        //First load the config is we haven't already.
        if(!isset($this->resource_config)) {
            $this->load_config();
        }

        //If we haven't already loaded and decompressed the data, load it now.
        if(!isset($this->resource_data)) {
            $this->reassemble_data();
        }

        return $this->resource_data;
    }

    /**
     * Splits the resource's data into chunks and saves them to the resource's directory.
     * @param $fragment_size The size of each fragment in megabytes. Defualt is 10 MB
     */
    public function save_data($fragment_size = 10) {
        $bytes_per_fragment = $fragment_size * 1000 * 1000;

        if(!isset($this->resource_config) || !isset($this->resource_data)) {
            throw new \Exception("Resource config and/or data was not set! Resource could not be saved!");
        }

        //First clean the resource directory
        $this->clean_resource_directory();
        //Reset the config
        $this->resource_config->file_fragments = array();

        //Split the data into fragments and save them to the resource directory
        $fragments = str_split($this->resource_data, $bytes_per_fragment);
        foreach($fragments as $index => $fragment) {
            file_put_contents($this->resource_path . $this->resource_id . "/" . $index, $fragment);
            $this->resource_config->file_fragments[] = $index;
        }

        //Save the config
        file_put_contents($this->resource_path . $this->resource_id . "/config.json", json_encode($this->resource_config));
    }

    /**
     * Reassembles the resource's data and places it in the resource_data variable
     */
    private function reassemble_data() {
        //Load the data from the file and reassemble it
        $raw_file_data = "";
        foreach($this->resource_config->file_fragments as $fragment) {
            $raw_file_data .= file_get_contents($this->resource_path . $this->resource_id . "/" . $fragment);
        }

        $this->resource_data = $raw_file_data;
    }

    /**
     * Cleans the resource directory of all files.
     */
    private function clean_resource_directory() {
        if(!$this->exists()) {
            throw new \Exception("Resource '$this->resource_id' does not exist.");
        }

        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->resource_path . $this->resource_id), \RecursiveIteratorIterator::CHILD_FIRST);
        foreach($files as $file) {
            if($file->isDir()) {
                rmdir($file->getRealPath());
            }else {
                unlink($file->getRealPath());
            }
        }
    }

}