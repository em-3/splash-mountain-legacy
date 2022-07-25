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

    <header>
        <picture class="logo" onclick="window.location.href = '/'">
            <source srcset="/images/logo-white.png" media="(prefers-color-scheme: dark)">
            <img src="/images/logo-black.png">
        </picture>
    
        <div class="linksContainer">
            <div class="links">
                <a href="/">Home</a>
                <a href="/database">Database</a>
                <a href="/news">News</a>
                <a href="/about">About</a>
                <a class="admin current" href="/admin">Admin</a>
                <button class="search" onclick="document.querySelector('.searchField input').focus()">
                    <picture>
                        <source srcset="/images/icons/search-white.svg" media="(prefers-color-scheme: dark)">
                        <img src="/images/icons/search-black.svg" alt="Search" width="22px" height="22px">
                    </picture>
                </button>
            </div>
        </div>
    
        <div class="searchBox">
            <input type="text" class="searchField" placeholder="Search">
            <div class="clearButton" onclick="searchBar.close()">
                <picture>
                    <source srcset="/images/icons/close-white.svg" media="(prefers-color-scheme: dark)">
                    <img src="/images/icons/close-black.svg" alt="Close Search" width="14px" height="14px">
                </picture>
            </div>
        </div>
    </header>

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
        <section class="databaseBrowser">
            <div class="searchControls">

                <div class="controls">
                    <div class="searchField">
                        <input type="text" placeholder="Filter" oninput="databaseBrowser.searchBar.oninput()"
                            onchange="databaseBrowser.searchBar.onchange()">
                    </div>
                    <div class="filterBar">
                        <div class="filters"></div>
                        <div class="addFilter" onclick="showFilterSelect()">+</div>
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
                    <div class="closeButton" onclick="hideFilterSelect()">✕</div>
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

    <footer>
        <div class="left">
            <div class="logoContainer">
                <img class="logo" src="/images/logo-white.png" onclick="window.location.href = '/'">
                <div class="links">
                    <a class="link email" href="mailto:splashmountainlegacy@gmail.com" target="_BLANK">
                        <picture class="regular">
                            <source srcset="/images/footer/email-white.png" media="(prefers-color-scheme: dark)">
                            <img src="/images/footer/email-black.png" alt="Email" width="22px" height="auto">
                        </picture>
                        <img src="/images/footer/email-white.png" alt="Email" width="22px" height="auto" class="hover">
                    </a>
                    <a class="link youtube" href="https://www.youtube.com/channel/UCmh3ksrwPB-NRcfMjGUbYFw" target="_BLANK">
                        <picture class="regular">
                            <source srcset="/images/footer/youtube-white.png" media="(prefers-color-scheme: dark)">
                            <img src="/images/footer/youtube-black.png" alt="Youtube" width="22px" height="auto">
                        </picture>
                        <img src="/images/footer/youtube-white.png" alt="Youtube" width="22px" height="auto" class="hover">
                    </a>
                    <a class="link discord" href="https://discord.gg/GwThxWbQMG" target="_BLANK">
                        <picture class="regular">
                            <source srcset="/images/footer/discord-white.png" media="(prefers-color-scheme: dark)">
                            <img src="/images/footer/discord-black.png" alt="Youtube" width="22px" height="auto">
                        </picture>
                        <img src="/images/footer/discord-white.png" alt="Discord" width="22px" height="auto" class="hover">
                    </a>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="credits">
                <h3>Created By</h3>
                <a href="https://www.youtube.com/channel/UCJau8EhvBih5QfGb3s2nVvA" target="_BLANK">91J Sound</a>
                <a>EM_3</a>
                <a href="https://www.youtube.com/channel/UCnL5QGcUhQo1SLOuL23yG1A" target="_BLANK">MickeyWaffleCo.</a>
            </div>
        </div>
    </footer>

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