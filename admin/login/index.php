<?php

require_once __DIR__ . "/../scripts/init_admin.php";
require_once __DIR__ . "/../scripts/jwt_nonce.php";

//Redirect the user if they're already logged in
if(check_authentication()) {
    header("Location: /admin/index.php");
    exit;
}

$error = "";

//Regenerate the session ID to prevent session fixation attacks
session_regenerate_id();

if($_SERVER["REQUEST_METHOD"] === "POST") {
    if(!isset($_POST["nonce"]) || !isset($_POST["username"]) || !isset($_POST["password"])) {
        $error = "Invalid login attempt. Missing form data.";
    }else {
        //Verify the nonce
        if(!verify_nonce($_POST["nonce"], $_SESSION["nonce"], $_ENV["JWT_SECRET"])) {
            $error = "Invalid nonce. Please try again.";
        }else {
            //Check the username and password
            $username = $_POST["username"];
            $password = $_POST["password"];

            $stmt = $database->prepare("SELECT `id`, `password` FROM `admins` WHERE `username` = ?");
            $stmt->bindValue(1, $username, PDO::PARAM_STR);
            $stmt->execute();

            if($stmt->rowCount() != 1) {
                $error = "Invalid username or password.";
            }else {
                $user_data = $stmt->fetch(PDO::FETCH_ASSOC);
                
                //Check the password
                if(!password_verify($password, $user_data["password"])) {
                    $error = "Invalid username or password.";
                }else {
                    //Store the user ID in the session
                    $_SESSION["id"] = $user_data["id"];

                    //Redirect the user to the main page
                    header("Location: /admin/index.php");
                    exit;
                }
            }
        }
    }
}

//Generate a JWT nonce
$nonce = bin2hex(random_bytes(16));
$_SESSION["nonce"] = $nonce;
$jwt = generate_nonce($_ENV["JWT_SECRET"], $nonce);

?>

<!DOCTYPE HTML>
<html>
    
    <head>
        
        <meta charset="utf-8">
        <title>Login - Splash Mountain Legacy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/css/global.css">
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="../css/login.css">
        
        <meta name="description" content="Splash Mountain images, videos, audio, and more.">
        <meta name="keywords" content="Splash Mountain, Splash Mountain Legacy, SaveSplashMountain, Critter Country, Frontierland, Disneyland, Tokyo Disneyland, Magic Kingdom, Walt Disney World">

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
                    <a href="/about">About</a>
                    <a class="admin current" href="/admin">Admin</a>
                    <button class="search" onclick="searchBar.onfocus();">
                        <picture>
                            <source srcset="/images/icons/search-white.svg" media="(prefers-color-scheme: dark)">
                            <img src="/images/icons/search-black.svg" alt="Search" width="22px" height="22px">
                        </picture>
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
            <section>
                <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="POST">
                    <div class="titleContainer">
                        <h1>Login to Admin Console</h1>
                        <?php if($error != "") { ?>
                            <p class="errorMessage"><?php echo $error; ?></p>
                        <?php } ?>
                    </div>
                    <div>
                        <input type="hidden" name="nonce" value="<?php echo $jwt; ?>">
                        <input type="text" name="username" placeholder="Username">
                        <input type="password" name="password" placeholder="Password">
                    </div>
                    <input type="submit" value="Login">
                </form>
            </section>
        </main>

        <footer>
            <div class="logo">
                <img src="/images/logo-white.png" onclick="window.location.href = '/'">
            </div>
            <div class="credits">
                <h3>Created By</h3>
                <a href="https://www.youtube.com/channel/UCJau8EhvBih5QfGb3s2nVvA" target="_BLANK">91J Loves Disney</a>
                <a>EM_3</a>
                <a href="https://www.youtube.com/channel/UCnL5QGcUhQo1SLOuL23yG1A" target="_BLANK">MickeyWaffleCo.</a>
            </div>
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
        </footer>

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