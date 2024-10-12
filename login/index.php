<?php

require_once __DIR__ . "/../scripts/init.php";

use SplmlFoundation\SplashMountainLegacyBackend\Discord;
use Wohali\OAuth2\Client\Provider\Discord as Provider;

//Redirect the user if they're already logged in
if(check_authentication()) {
    header("Location: /");
    exit;
}

$error = "";
$user;

//Regenerate the session ID to prevent session fixation attacks
session_regenerate_id();

$provider = new Provider([
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
            $discord = new Discord($_SESSION["token"], $database, "discord_users");

            $user = $discord->getUserDetails();

            if(isset($user["clearance"])) {
                $_SESSION["id"] = $user["id"];
                $_SESSION["clearance"] = $user["clearance"];
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
            <img class="profilePicture" src="https://cdn.discordapp.com/avatars/<?php echo $user["id"] . "/" . $user["avatar_hash"]; ?>">
            <h1 class="name"><?php echo $user["username"] . "#" . $user["discriminator"]; ?></h1>
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
            <button class="continueButton" onclick="window.location.href='/admin'">Continue</button>
            <?php }else { ?>
            <!-- User is not allowed access -->
            <p class="authLevelWarning">Sorry, you don't have access to the site yet.</p>
            <?php } ?>
        </section>
        <?php } ?>
    </main>

    <?php include '../global/footer/index.html'; ?>

    <div class="itemDetailsContainer hidden">
        <iframe src="" frameborder="0"></iframe>
    </div>

    <div class="overlay"></div>

    <script src="/js/global.js"></script>
    <script src="/js/main.js"></script>
    <script src="/js/search.js"></script>

</body>

</html>