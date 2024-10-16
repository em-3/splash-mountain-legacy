<?php

require_once __DIR__ . "/scripts/global.php";

?>
<!DOCTYPE HTML>
<html>

<head>

    <meta charset="utf-8">
    <title>Splash Mountain Legacy</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="/css/index.css">

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

    <?php include 'global/header/index.html'; ?>

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
            <div class="background"></div>
            <div class="foreground">
                <img src="images/logo-white.png" alt="Splash Mountain Legacy">
            </div>
        </section>
        <section class="waitTimes featured">
            <div class="header">
                <h1 class="title">Wait Times</h1>
            </div>
            <div class="loading">
                <div class="loadingAnimationEllipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="content hidden">
                <div class="dl">
                <div class="top">
                        <p class="label">DL</p>
                        <p class="currentTime"></p>
                    </div>
                    <h1 class="time">Closed</h1>
                    <p class="status">Permanently Closed</p>
                    <p class="updatedTime">Last updated May 30, 2023</p>
                </div>
                <div class="wdw">
                    <div class="top">
                        <p class="label">WDW</p>
                        <p class="currentTime"></p>
                    </div>
                    <h1 class="time">Closed</h1>
                    <p class="status">Permanently Closed</p>
                    <p class="updatedTime">Last updated Jan 23, 2023</p>
                </div>
                <div class="tdl">
                    <div class="top">
                        <p class="label">TDL</p>
                        <p class="currentTime"></p>
                    </div>
                    <h1 class="time"></h1>
                    <p class="status"></p>
                    <p class="updatedTime"></p>
                </div>
            </div>
            <div class="error hidden">
                <h2>Something Went Wrong</h2>
                <p>Content failed to load.</p>
            </div>
        </section>
        <section class="news featured">
            <div class="header">
                <h1 class="title">News</h1>
                <button onclick="location.href = '/news'">See All News</button>
            </div>
            <div class="loading">
                <div class="loadingAnimationEllipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="content hidden"></div>
            <div class="error hidden">
                <h2>Something Went Wrong</h2>
                <p>Content failed to load.</p>
            </div>
        </section>
        <section class="databaseAdditions featured">
            <div class="header">
                <h1 class="title">Recent Database Additions</h1>
                <button onclick="location.href = '/database'">Browse Database</button>
            </div>
            <div class="loading">
                <div class="loadingAnimationEllipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="content hidden"></div>
            <div class="error hidden">
                <h2>Something Went Wrong</h2>
                <p>Content failed to load.</p>
            </div>
        </section>
    </main>

    <?php include 'global/footer/index.html'; ?>

    <div class="itemDetailsContainer hidden">
        <iframe src="" frameborder="0"></iframe>
    </div>

    <div class="overlay"></div>

    <script src="/js/global.js"></script>
    <script src="/js/main.js"></script>
    <script src="/js/search.js"></script>
    <script src="/js/index.js"></script>

</body>

</html>