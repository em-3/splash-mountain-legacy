<?php

require_once __DIR__ . "/scripts/init_admin.php";

//Redirect the user if they are not logged in
if(!check_authentication()) {
    header("Location: /admin/login.php");
    exit;
}

?>
<!DOCTYPE HTML>
<html>
    
    <head>
        
        <meta charset="utf-8">
        <title>Admin Console</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/css/global.css">
        <link rel="stylesheet" href="/css/admin.css">

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
            <picture class="logo">
                <source srcset="/images/logo-white.png" media="(prefers-color-scheme: dark)">
                <img src="/images/logo-black.png" height="80px" width="auto">
            </picture>
        </header>

        <main>
            <section class="formContainer">
                <h1>Add an Item to the Database</h1>
                <form action="">
                    <fieldset>
                        <legend>Item Type</legend>
                        <label for="type">
                        <select name="type" id="type" onchange="updateItemType()" required>
                            <option value="image" selected>Image</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="date">Date</option>
                            <option value="text">Text</option>
                        </select>
                    </fieldset>
                    <fieldset id="content">
                        <legend>Content</legend>
                        <label for="file">Image</label>
                        <input type="file" accept="image/png, image/jpeg" name="file" id="file">
                        <label for="videoID" class="hidden">YouTube Video ID</label>
                        <input type="text" id="videoID" name="videoID" placeholder="dQw4w9WgXcQ" class="hidden">
                    </fieldset>
                    <fieldset>
                        <legend>Description</legend>
                        <!-- Name -->
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" placeholder="Splash Mountain" required>
                        <!-- Description -->
                        <label for="description">Description</label>
                        <textarea id="description" name="description" placeholder="Splash Mountain as seen at sunset." required></textarea>
                        <!-- Author -->
                        <label for="authorName">Author Name</label>
                        <input type="text" id="authorName" name="authorName" placeholder="91J Loves Disney">
                        <label for="authorURL">Author Link</label>
                        <input type="url" id="authorURL" name="authorURL" placeholder="https://youtu.be/dQw4w9WgXcQ">
                        <!-- Park -->
                        <label for="park">Park</label>
                        <select name="park" id="park" required>
                            <option value="DL" selected>Disneyland</option>
                            <option value="TDL">Tokyo Disneyland</option>
                            <option value="WDW">Walt Disney World</option>
                        </select>
                    </fieldset>
                    <fieldset id="metadata">
                        <legend>Metadata</legend>
                        <!-- Timestamp -->
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date">
                        <label for="time">Time</label>
                        <input type="time" id="time" name="time">

                        <!-- Make -->
                        <label for="make">Make</label>
                        <input type="text" id="make" name="make">
                        <!-- Model -->
                        <label for="model">Model</label>
                        <input type="text" id="model" name="model">

                        <div id="camera">
                            <!-- Focal Length -->
                            <label for="focalLength">Focal Length</label>
                            <input type="text" id="focalLength" name="focalLength" placeholder="20.1 mm">
                            <!-- Software Version-->
                            <label for="software">Software Version</label>
                            <input type="text" id="software" name="software" placeholder="15.0">
                            <!-- Exposure Time -->
                            <label for="exposureTime">Exposure Time</label>
                            <input type="text" id="exposureTime" name="exposureTime" placeholder="1/50">
                            <!-- F-number -->
                            <label for="fNumber">Aperature F-Number</label>
                            <input type="text" id="fNumber" name="fNumber" placeholder="4.0">
                            <!-- Flash -->
                            <label for="flash">Flash</label>
                            <input type="text" id="flash" name="flash" placeholder="Flash did not fire">
                            <!-- Color Space -->
                            <label for="colorSpace">Color Space</label>
                            <input type="text" id="colorSpace" name="colorSpace" placeholder="sRGB">
                        </div>
                        <div id="microphone" class="hidden">
                            <!-- Sampling Rate -->
                            <label for="samplingRate">Sampling Rate</label>
                            <input type="number" id="samplingRate" name="samplingRate">
                        </div>

                    </fieldset>

                    <button id="submitButton" type="button" onclick="submitForm()">Add</button>
                </form>
            </section>
            <section class="loadingContainer hidden">
                <div class="loadingAnimationEllipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </section>
            <section class="responseContainer hidden">
                <h1>Done.</h1>
                <p>Your item has been added to the database.</p>
                <p class="itemID"></p>
            </section>
        </main>
        
        <script src="/js/global.js"></script>
        <script src="/js/admin.js"></script>
        <script src="/js/EXIF.js"></script>
        
    </body>
    
</html>