<?php

require_once __DIR__ . "/../../../scripts/init.php";

$params = array();

$stmt = "SELECT `id`, `title`, `subtitle`, `author`, `publication_timestamp`, `thumbnail`, `content` FROM `news_articles`";

if(!isset($_GET["show_unpublished"]) || $_GET["show_unpublished"] != "true" || !check_authentication()) {
    $stmt .= " WHERE `publication_timestamp` < UNIX_TIMESTAMP()";
}

//Check if there is a query parameter
if(isset($_GET["query"])) {
    $stmt .= " AND (`title` LIKE :query OR `subtitle` LIKE :query OR `author` LIKE :query)";
    $params["query"] = "%" . $_GET["query"] . "%";
}

$stmt .= " ORDER BY `publication_timestamp` DESC";

if(isset($_GET["max"])) {
    $max = intval($_GET["max"]);

    if(isset($_GET["min"])) {
        //If there's a minimum value specified, then add it to the parameters and calculate the difference between the min and max values
        $min = intval($_GET["min"]);

        $params["min"] = $min - 1;
        $params["max"] = $max - $min;
    }else {
        //Otherwise just add zero and the max value
        $params["min"] = 0;
        $params["max"] = $max;
    }

    //Update the statement to include the min and max
    $stmt .= " LIMIT :min, :max";
}

//Prepare the statement
$stmt = $database->prepare($stmt);

foreach($params as $param=>$param_value) {
    if(is_int($param_value)) {
        $stmt->bindValue($param, $param_value, PDO::PARAM_INT);
    }else {
        $stmt->bindValue($param, $param_value, PDO::PARAM_STR);
    }
}

//Execute the statement
$stmt->execute();

//Format the results
$articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($articles as &$article) {
    if(isset($article["content"])) {
        //Get the content of the article
        $content = json_decode($article["content"]);

        //Find the first string in the item content
        foreach($content as $item) {
            if(is_string($item)) {
                //Store the string on the main article object
                $article["content_preview"] = $item;
            }else if(is_object($item) && isset($item->type) && $item->type == "paragraph") {
                //Store the paragraph on the main article object
                $article["content_preview"] = $item->content;
            }
            if(isset($article["content_preview"])) {
                //Filter out Markdown formatting
                //Bold
                $article["content_preview"] = preg_replace("/\*\*(.*?)\*\*/", "$1", $article["content_preview"]);
                //Italics
                $article["content_preview"] = preg_replace("/\*(.*?)\*/", "$1", $article["content_preview"]);
                //Strikethrough
                $article["content_preview"] = preg_replace("/~~(.*?)~~/", "$1", $article["content_preview"]);
                //Underline
                $article["content_preview"] = preg_replace("/__(.*?)__/", "$1", $article["content_preview"]);
                //Superscript
                $article["content_preview"] = preg_replace("/\^\^(.*?)\^\^/", "$1", $article["content_preview"]);
                //Subscript
                $article["content_preview"] = preg_replace("/,,(.*?),,/", "$1", $article["content_preview"]);
                //Links
                $article["content_preview"] = preg_replace("/\[(.*?)\]\((.*?)\)/", "$1", $article["content_preview"]);
                
                break;
            }
        }
    }
}

//Output the results
header("Content-Type: application/json");
echo json_encode($articles);
?>