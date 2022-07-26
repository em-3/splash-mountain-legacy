<?php

require_once __DIR__ . "/scripts/init_admin.php";

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
                <button class="search" onclick="searchBar.onfocus();">
                    <i class="gg-search"></i>
                </button>
            </div>
        </div>

        <div class="searchBox">
            <input type="text" class="searchField" placeholder="Search" oninput="searchBar.updateSearchResults()"
                onfocus="searchBar.onfocus()" onblur="searchBar.onblur()">
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
        <section class="header">
            <h1>Admin Console</h1>
            <div class="profileInformation">
                <img src="/images/mwc.jpg" alt="" class="profilePicture">
                <div class="text">
                    <h3 class="name">Name</h3>
                    <p class="authorizationLevel">Authorization Level</p>
                </div>
                <button class="logout" onclick="logout()">
                    <i class="gg-log-out"></i>
                </button>
            </div>
        </section>
        <section class="pageLinks">
            <a href="/admin/database">
                <div class="pageLink databaseBrowser">
                    <div class="icon">
                        <i class="gg-database"></i>
                    </div>
                    <div class="text">
                        <h2>Database Browser</h2>
                        <p>Upload, edit, and delete items.</p>
                    </div>
                    <i class="gg-chevron-right"></i>
                </div>
            </a>
            <a href="/admin/newsList">
                <div class="pageLink newsList">
                    <div class="icon">
                        <i class="gg-file-document"></i>
                    </div>
                    <div class="text">
                        <h2>News List</h2>
                        <p>Create, edit, and delete news articles.</p>
                    </div>
                    <i class="gg-chevron-right"></i>
                </div>
            </a>
            <a href="/admin/auditLog">
                <div class="pageLink auditLog">
                    <div class="icon">
                        <i class="gg-play-list-search"></i>
                    </div>
                    <div class="text">
                        <h2>Audit Log</h2>
                        <p>View a history of database changes.</p>
                    </div>
                    <i class="gg-chevron-right"></i>
                </div>
            </a>
        </section>
    </main>

    <div class="overlay"></div>

    <div class="editorContainer databaseItemEditorContainer hidden">
        <iframe src="" frameborder="0"></iframe>
    </div>

    <div class="editorContainer articleEditorContainer hidden">
        <iframe src="" frameborder="0"></iframe>
    </div>

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
    <script src="/js/search.js"></script>
    <script src="script.js"></script>

</body>

</html>