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
    <link rel="stylesheet" href="/admin/admin-global.css">
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
        <section class="header">
            <div class="text">
                <h1>Admin Console</h1>
                <div class="profileInformation">
                    <img src="/images/authors/splashmountainlegacystaff.jpg" alt="" class="profilePicture">
                    <div class="text">
                        <h3 class="name">Loading...</h3>
                        <p class="authorizationLevel">Fetching user profile.</p>
                    </div>
                </div>
                <div class="actions">
                    <button class="create" onclick="">
                        <div class="icon"><iconify-icon icon="mdi:plus" width="24"></iconify-icon></div>
                        <span>Create</span>
                    </button>
                    <button class="logout" onclick="logout()">
                        <div class="icon"><iconify-icon icon="mdi:logout" width="24"></iconify-icon></div>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </section>
        <section class="pageLinks">
            <a href="/admin/database">
                <div class="pageLink databaseBrowser">
                    <div class="icon">
                        <iconify-icon icon="mdi:database" width="48"></iconify-icon>
                    </div>
                    <div class="text">
                        <h2>Database Browser</h2>
                        <p>Upload, edit, and delete items.</p>
                    </div>
                    <iconify-icon icon="mdi:chevron-right" width="48"></iconify-icon>
                </div>
            </a>
            <a href="/admin/newsList">
                <div class="pageLink newsList">
                    <div class="icon">
                        <iconify-icon icon="mdi:file-document" width="48"></iconify-icon>
                    </div>
                    <div class="text">
                        <h2>News List</h2>
                        <p>Create, edit, and delete news articles.</p>
                    </div>
                    <iconify-icon icon="mdi:chevron-right" width="48"></iconify-icon>
                </div>
            </a>
            <a href="/admin/audit-log">
                <div class="pageLink auditLog">
                    <div class="icon">
                        <iconify-icon icon="material-symbols:manage-search" width="48"></iconify-icon>
                    </div>
                    <div class="text">
                        <h2>Audit Log</h2>
                        <p>View a history of database changes.</p>
                    </div>
                    <iconify-icon icon="mdi:chevron-right" width="48"></iconify-icon>
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