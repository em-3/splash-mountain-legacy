<?php

require_once __DIR__ . "/../../scripts/init_admin.php";

//Redirect the user if they're not logged in
if(!check_authentication() || !check_clearance(0)) {
    header("Location: /login/index.php");
    exit;
}

?>
<!DOCTYPE HTML>
<html>

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="styles.css">

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2f8ea9">
    <meta name="msapplication-TileColor" content="#2d89ef">

    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#222222" media="(prefers-color-scheme: dark)">

</head>

<body ontouchstart class>

    <header>
        <i class="gg-close" onclick="closeEditor()"></i>
    </header>

    <main>
        <section class="loadingContainer centered">
            <div class="loadingAnimationEllipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </section>
        <section class="errorContainer centered hidden">
            <h1>An unidentified error has occured.</h1>
        </section>
        <section class="editor hidden">
            <div class="articleInfo">
                <div class="thumbnail">
                    <img src="" class="hidden">
                    <iframe src="" class="hidden" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="textContainer">
                    <h1 class="articleName"></h1>
                    <p>Article ID: <span class="articleID" style="font-weight: bold;"></span></p>
                </div>
            </div>
            <div class="articleEditor">
                <div class="properties"></div>
                <div class="content">
                    <div class="fields"></div>
                    <div class="addContentField">
                        <div class="icon"><i class="gg-math-plus"></i></div>
                        <p>Add Section</p>
                    </div>
                </div>
                <h2 class="errorMessage hidden"></h2>
                <div class="actions existingArticle hidden">
                    <div class="passive">
                        <button class="cancel" onclick="closeEditor()">
                            <div class="icon"><i class="gg-close"></i></div>
                            <span>Cancel Changes</span>
                        </button>
                        <button class="save" onclick="updateArticle()">
                            <div class="icon"><i class="gg-drive"></i></div>
                            <span>Update Article</span>
                        </button>
                    </div>
                    <div class="danger">
                        <button class="delete" onclick="deleteArticle()">
                            <div class="icon"><i class="gg-trash"></i></div>
                            <span>Delete Article</span>
                        </button>
                    </div>
                </div>
                <div class="actions newArticle hidden">
                    <div class="danger">
                        <button class="cancel" onclick="closeEditor()">
                            <div class="icon"><i class="gg-close"></i></div>
                            <span>Cancel</span>
                        </button>
                    </div>
                    <div class="passive">
                        <button class="save" onclick="uploadArticle()">
                            <div class="icon"><i class="gg-software-upload"></i></div>
                            <span>Upload Article</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
        <section class="progressContainer centered hidden">
            <div class="animation"></div>
            <div class="progressIndicator">
                <div class="determinate hidden"></div>
                <div class="indeterminate">
                    <div class="loadingAnimationEllipsis">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </section>
        <section class="responseContainer centered hidden">
            <h1 class="title"></h1>
            <h2 class="subtitle"></h2>
            <p class="message"></p>
            <div class="actions"></div>
        </section>
    </main>

    <div class="overlay"></div>

    <script src="/js/global.js"></script>
    <script src="script.js"></script>

</body>

</html>