<?php

require_once __DIR__ . "/scripts/init_admin.php";
require_once __DIR__ . "/scripts/jwt_nonce.php";

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
            $error = "Invalid login attempt. Invalid nonce.";
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Splash Mountain Legacy - Admin Login Portal</title>
</head>
<body>
    <h1>Splash Mountain Legacy - Admin Login Portal</h1>
    <?php if($error != "") { ?>
        <p style="color: red;"><?php echo $error; ?></p>
    <?php } ?>
    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="POST">
        <input type="hidden" name="nonce" value="<?php echo $jwt; ?>">
        <input type="text" name="username" placeholder="Username">
        <input type="password" name="password" placeholder="Password">
        <input type="submit" value="Login">
    </form>
</body>
</html>