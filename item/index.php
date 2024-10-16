<?php

require_once __DIR__ . "/../scripts/init.php";
require_once __DIR__ . "/../scripts/global.php";
require_once __DIR__ . "/../scripts/viewer_meta.php";

?>
<!DOCTYPE HTML>
<html>

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">

    <?php output_meta_tags("/item/", "item_index", "name", "description", "image"); ?>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="../styles.css">

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2f8ea9">
    <meta name="msapplication-TileColor" content="#2d89ef">
    
    <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"></script>

</head>

<body ontouchstart class="mobile">

    <?php
    // If the embedded parameter isn't set, include the global header
    if (!isset($_GET["embedded"])) {
        include '../global/header/index.html';
    }
    ?>

    <main>
        <div class="closeButton" onclick="closeItemViewer()">
            <iconify-icon icon="mdi:close"></iconify-icon>
            <p>Close</p>
        </div>
        <div class="contentContainer">
            <div class="loadingScreen">
                <div class="loadingAnimationContainer">
                    <div class="loadingAnimationEllipsis">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="errorScreen hidden">
                <div class="errorMessageContainer">
                    <picture>
                        <source srcset="/images/icons/error-white.svg" media="(prefers-color-scheme: dark)">
                        <img class="errorIcon" src="/images/icons/error-black.svg" width="auto" height="50pt">
                    </picture>
                    <p class="errorMessage">Item could not be loaded.</p>
                </div>
            </div>
            <div class="contentDisplay hidden invisible"></div>
        </div>
        <div class="itemInfoContainer hidden">
            <div class="locationContainer">
                <div class="parkContainer">
                    <iconify-icon icon="material-symbols:push-pin"></iconify-icon>
                    <h2 class="park"></h2>
                </div>
                <div class="sceneContainer">
                    <iconify-icon icon="material-symbols:pin-drop"></iconify-icon>
                    <h2 class="scene"></h2>
                </div>
            </div>
            <h1 class="name"></h1>
            <div class="propertiesContainer"></div>
            <div class="tags hidden">
                <div class="labelContainer">
                    <div class="iconContainer"><iconify-icon icon="mdi:tag"></iconify-icon></div>
                    <p class="label">Tags</p>
                </div>
                <div class="tagsContainer"></div>
            </div>
            <div class="linkedItems hidden">
                <div class="labelContainer">
                    <div class="iconContainer"><iconify-icon icon="mdi:link"></iconify-icon></div>
                    <p class="label">Linked Items</p>
                </div>
                <div class="itemsContainer"></div>
            </div>
            <div class="metadata hidden">
                <div class="header">
                    <div class="device">
                        <p class="make"></p>
                        <p class="model"></p>
                    </div>
                    <div class="version hidden"></div>
                </div>
                <div class="content"></div>
            </div>

            <div class="buttonContainer">
                <button class="share" onclick="share(event)">
                    <iconify-icon icon="mdi:share" width="24"></iconify-icon>
                    <span>Share</span>
                </button>
                <button class="editItem hidden" onclick="editItem()">
                    <iconify-icon icon="mdi:edit" width="24"></iconify-icon>
                    <span>Edit Item</span>
                </button>
            </div>
        </div>
    </main>

    <?php
    // If the embedded parameter isn't set, include the global footer
    if (!isset($_GET["embedded"])) {
        include '../global/footer/index.html';
    }
    ?>

    <div class="itemDetailsContainer hidden">
        <iframe src="" frameborder="0"></iframe>
    </div>

    <div class="overlay"></div>

    <script src="/js/global.js"></script>
    <script src="/js/main.js"></script>
    <script src="../script.js"></script>

</body>

</html>