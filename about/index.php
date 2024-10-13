<?php

require_once __DIR__ . "/../scripts/global.php";

?>
<!DOCTYPE HTML>
<html>

<head>

    <meta charset="utf-8">
    <title>About - Splash Mountain Legacy</title>
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
    
    <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"></script>

</head>

<body ontouchstart class>

    <?php include '../global/header/index.html'; ?>

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
        <section class="hero">
            <div class="textContainer">
                <h1>History should never be forgotten.</h1>
                <p>Splash Mountain Legacy serves as a treasury of media and information about Splash Mountain at Disney Parks around the world,
                    preserving the legacy of the attraction for generations to come.</p>
            </div>
        </section>
        <section class="content free">
            <h2>Completely Free.</h2>
            <p>Splash Mountain Legacy exists to preserve the attraction's history, and in order to do so as effectively as
                possible, all media and content on the site is free for everyone to access.</p>
        </section>
        <section class="content community">
            <h2>By the Community, For the Community.</h2>
            <p>Splash Mountain Legacy is a project created, contributed to, and maintained by members of the Splash Mountain
                fanbase. The site was developed by three friends who share a love for the attraction, and other members of the
                community are invited to help contribute media and improve the site.</p>
        </section>
        <section class="creators">
            <h2>Meet the Creators.</h2>
            <div class="creatorList">
                <div class="creator link" onclick="window.location.href = 'https://www.youtube.com/channel/UCJau8EhvBih5QfGb3s2nVvA'">
                    <div class="nameContainer">
                        <img src="/images/91j.jpg" alt="">
                        <h2>91J Sound</h2>
                    </div>
                    <div class="info">
                        <ul>
                            <li>Project Manager</li>
                            <li>Audio Manager</li>
                            <li>Data Auditor</li>
                        </ul>
                    </div>
                </div>
                <div class="creator">
                    <div class="nameContainer">
                        <img src="/images/em3.jpg" alt="">
                        <h2>EM_3</h2>
                    </div>
                    <div class="info">
                        <ul>
                            <li>Backend</li>
                            <li>System Administrator</li>
                            <li>Database Engineer</li>
                        </ul>
                    </div>
                </div>
                <div class="creator link" onclick="window.location.href = 'https://www.youtube.com/channel/UCnL5QGcUhQo1SLOuL23yG1A'">
                    <div class="nameContainer">
                        <img src="/images/mwc.jpg" alt="">
                        <h2>MickeyWaffleCo.</h2>
                    </div>
                    <div class="info">
                        <ul>
                            <li>Frontend</li>
                            <li>Database Curator</li>
                            <li>Publicity Manager</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <?php include '../global/footer/index.html'; ?>

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