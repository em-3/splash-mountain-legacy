<?php

namespace SplmlFoundation\SplashMountainLegacyBackend;

class ArticleEntry extends Entry {

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