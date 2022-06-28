<?php

namespace SplmlFoundation\SplashMountainLegacyBackend;

class ItemEntry extends Entry {

    public static function getRequiredFields() {
        return ["id", "name", "type", "park", "description"];
    }

    public static function getOptionalFields() {
        return ["author", "video_id", "image", "source", "scene", "metadata", "tags", "timestamp", "hidden"];
    }

    public static function getModifiableFields() {
        return ["name", "park", "description", "author", "video_id", "image", "source", "scene", "metadata", "tags", "timestamp", "hidden"];
    }

}

?>