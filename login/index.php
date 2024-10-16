<?php

require_once __DIR__ . "/../scripts/init.php";
require_once __DIR__ . "/../scripts/jwt_nonce.php";

//Redirect the user if they're already logged in
if(check_authentication()) {
    header("Location: /");
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

            $stmt = $database->prepare("SELECT `id`, `password`, `clearance` FROM `users` WHERE `username` = ?");
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
                    //Store the user ID and clearance in the session
                    $_SESSION["id"] = $user_data["id"];
                    $_SESSION["clearance"] = $user_data["clearance"];

                    //Redirect the user to the admin page
                    header("Location: /admin/");
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
            <section class="loginPromptContainer">
                <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="POST">
                    <div class="titleContainer">
                        <h1>Login</h1>
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