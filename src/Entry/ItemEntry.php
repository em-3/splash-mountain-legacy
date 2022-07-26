<?php

namespace SplmlFoundation\SplashMountainLegacyBackend\Entry;

class ItemEntry extends Entry {

    protected function handleDataPut(&$field, &$data) {
        //Check if the tags field is currently being put
        if($field == "tags" && is_array($data)) {
            //Collapse the array into a string
            $data = implode(", ", $data);
        }
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