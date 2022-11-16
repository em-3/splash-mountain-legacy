<?php

require_once __DIR__ . "/../scripts/init_admin.php";

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
    <title>Admin - Splash Mountain Legacy</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="/admin/admin-global.css">
    <link rel="stylesheet" href="styles.css">

    <meta name="description" content="Splash Mountain images, videos, audio, and more.">
    <meta name="keywords"
        content="Splash Mountain, Splash Mountain Legacy, SaveSplashMountain, Critter Country, Frontierland, Disneyland, Tokyo Disneyland, Magic Kingdom, Walt Disney World">

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

    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#222222" media="(prefers-color-scheme: dark)">

</head>

<body ontouchstart class>

    <?php include '../../global/header/index.html'; ?>

    <div class="searchResultsContainer">
        <div class="loadingContainer hidden">
            <div class="loadingAnimationEllipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="resultsContainer"></div>
        <div class="errorMessageContainer">
            <h2 class="title"></h2>
            <p class="subtitle"></p>
        </div>
    </div>

    <main>
        <section class="header">
            <div class="text">
                <h1 class="title">Database</h1>
                <h2 class="subtitle">Admin Console</h2>
            </div>
            <a href="/admin" class="backLink">
                <i class="gg-chevron-left"></i>
                <span>Back to Admin Home</span>
            </a>
            <a onclick="showDatabaseItemEditor()" class="addItem">
                <i class="gg-math-plus"></i>
                <span>Create Item</span>
            </a>
        </section>
        <section class="databaseBrowser">
            <div class="searchControls">
                <div class="controls">
                    <div class="searchField">
                        <input type="text" placeholder="Filter" oninput="databaseBrowser.searchBar.oninput()"
                            onchange="databaseBrowser.searchBar.onchange()">
                    </div>
                    <div class="filterBar">
                        <div class="filters"></div>
                        <div class="addFilter" onclick="showFilterSelect()">
                            <i class="gg-math-plus"></i>
                        </div>
                    </div>
                    <div class="sortByContainer">
                        <p>Sort By:</p>
                        <select name="sortBy" class="sortBy" id="sortBy" onchange="databaseBrowser.refreshResults()">
                            <option value="name" selected>Name</option>
                            <option value="scene">Scene</option>
                            <option value="newest_first">Date Added (Newest First)</option>
                            <option value="oldest_first">Date Added (Oldest First)</option>
                        </select>
                    </div>
                </div>

                <div class="filterSelect hidden">
                    <div class="closeButton" onclick="hideFilterSelect()">
                        <i class="gg-close"></i>
                    </div>
                    <div class="availableFilters"></div>
                </div>
                
            </div>
            <div class="loadingContainer">
                <div class="loadingAnimationEllipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="resultsContainer hidden"></div>
            <div class="errorMessageContainer hidden">
                <h2 class="title"></h2>
                <p class="subtitle"></p>
            </div>
        </section>
    </main>

    <?php include '../../global/footer/index.html'; ?>

    <div class="itemDetailsContainer hidden">
        <iframe src="" frameborder="0"></iframe>
    </div>

    <div class="overlay"></div>

    <script src="/js/global.js"></script>
    <script src="/js/main.js"></script>
    <script src="script.js"></script>
    <script src="/js/search.js"></script>

</body>

</html>