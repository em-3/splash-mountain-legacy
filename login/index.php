<?php

require_once __DIR__ . "/../scripts/init.php";

use Wohali\OAuth2\Client\Provider\Discord;

//Redirect the user if they're already logged in
if(check_authentication()) {
    header("Location: /");
    exit;
}

$error = "";
$user;

//Regenerate the session ID to prevent session fixation attacks
session_regenerate_id();

$provider = new Discord([
    "clientId" => $_ENV["DISCORD_CLIENT_ID"],
    "clientSecret" => $_ENV["DISCORD_CLIENT_SECRET"],
    "redirectUri" => $_ENV["DISCORD_REDIRECT_URI_PREFIX"] . "/login/index.php"
]);

if(isset($_GET["login"]) && $_GET["login"] == "discord") {
    $authUrl = $provider->getAuthorizationUrl(["scope" => ["identify"]]);
    $_SESSION["oauth2state"] = $provider->getState();
    header("Location: " . $authUrl);
    exit();
}

//Check if the code has been provided
if(isset($_GET["code"])) {
    //Check the state stored in the session to mitigate CSRF attacks
    if(empty($_GET["state"]) || ($_GET["state"] !== $_SESSION["oauth2state"])) {
        //If the state isn't valid reset the session value
        unset($_SESSION["oauth2state"]);
        $error = "Your login state was bad. Please clear your cookies and try again.";
    }else {
        //Get the access token
        $token = $provider->getAccessToken("authorization_code", [
            "code" => $_GET["code"]
        ]);
    
        //Store the token for later use
        $_SESSION["token"] = $token->getToken();
    
        try {
            $user = $provider->getResourceOwner($token);

            //Get the user's data from the database
            $stmt = $database->prepare("SELECT `clearance` FROM discord_users WHERE `id` = ?");
            $stmt->execute([$user->getId()]);

            //Check if the user exists
            if($stmt->rowCount() == 1) {
                //Store their clearance level and ID
                $_SESSION["id"] = $user->getId();
                $_SESSION["clearance"] = $stmt->fetchAll(PDO::FETCH_ASSOC)[0]["clearance"];
            }
        }catch(Exception $e) {
            $error = "An exception occurred: " . $e->getMessage();
        }
    }
}

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

        <!-- <div class="linksContainer">
                <div class="links">
                    <a href="/">Home</a>
                    <a href="/database">Database</a>
                    <a href="/news">News</a>
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
            </div> -->
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
        <?php if(!isset($user)) { ?>
        <!-- Authentication not started or didn't succeed -->
        <section class="loginPromptContainer">
            <div class="titleContainer">
                <h1>Login</h1>
                <?php if($error != "") { ?>
                <p class="errorMessage">
                    <?php echo $error; ?>
                </p>
                <?php } ?>
            </div>
            <button class="loginButton" onclick="window.location.href='<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>?login=discord'">Login with Discord</a>
        </section>
        <?php }else { ?>
        <!-- Authentication succeeded -->
        <section class="welcomeContainer">
            <img class="profilePicture" src="https://cdn.discordapp.com/avatars/<?php echo $user->getID() . "/" . $user->getAvatarHash(); ?>">
            <h1 class="name"><?php echo $user->getUsername() . "#" . $user->getDiscriminator(); ?></h1>
            <h3 class="authLevel">
                <?php
                    if(!isset($_SESSION["clearance"])) {
                        echo "Unauthorized";
                    } else if($_SESSION["clearance"] == 0) {
                        echo "Admin";
                    } else {
                        echo "Launch Team";
                    }
                ?>
            </h3>
            <?php if(check_authentication()) { ?>
            <!-- User is allowed access -->
            <button class="continueButton" onclick="window.location.href='/'">Continue</button>
            <?php }else { ?>
            <!-- User is not allowed access -->
            <p class="authLevelWarning">Sorry, you don't have access to the site yet.</p>
            <?php } ?>
        </section>
        <?php } ?>
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
    <script src="/js/search.js"></script>

</body>

</html>