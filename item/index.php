<?php

require_once __DIR__ . "/../scripts/init.php";
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
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="../styles.css">

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9N1M0HPYP7"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-9N1M0HPYP7');
    </script>

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2f8ea9">
    <meta name="msapplication-TileColor" content="#2d89ef">

</head>

<body ontouchstart class>

    <main>
        <header class="hidden">
            <i class="gg-close" onclick="closeItemViewer()"></i>
        </header>
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
            <div class="parkContainer">
                <i class="gg-pin"></i>
                <h2 class="park"></h2>
            </div>
            <h1 class="name"></h1>
            <div class="tags hidden">
                <p class="label">Tags:</p>
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
                    <i class="gg-export" style="transform: translate(1px, 3px) scale(0.8)"></i>
                    <span>Share</span>
                </button>
                <button class="editItem hidden" onclick="editItem()">
                    <i class="gg-edit-exposure"></i>
                    <span>Edit Item</span>
                </button>
                <button class="copyID hidden" onclick="copyItemID()">
                    <i class="gg-copy"></i>
                    <span>Copy ID</span>
                </button>
            </div>
        </div>
    </main>

    <script src="/js/global.js"></script>
    <script src="../script.js"></script>

</body>

</html>