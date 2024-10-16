<!DOCTYPE HTML>
<html>

<head>

    <meta charset="utf-8">
    <title>Splash Mountain Legacy - Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="/errorPage/styles.css">

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

    <main>
        <section>
            <h1 class="quote">500</h1>
            <h3 class="subquote">Internal Server Error</h3>
            <p class="description">The server is currently unable to handle your request. Please try again in a minute.</p>
            <a class="link" onclick="location.reload()">Retry</a>
        </section>
    </main>

    <?php include '../global/footer/index.html'; ?>

    <script src="/js/global.js"></script>
    <script>
        var options = [
            {
                quote: "Looks Like Brer Fox and Brer Bear Are Causing Some Kind of Commotion Downstream.",
                subquote: "Your visit to Splash Mountain Legacy will continue in just a bit...",
                description: "The server is currently unable to handle your request. Please try again in a minute.",
                link: "Retry"
            },
            {
                quote: "Looks Like There's A Log Jam Up Ahead...",
                subquote: "Just stay seated and we'll be with you in no time.",
                description: "The server is currently unable to handle your request. Please try again in a minute.",
                link: "Retry"
            },
            {
                quote: "It Appears That Some Critters Are Making A Little Commotion Up Ahead...",
                subquote: "Please stay seated and keep your hands inside the boat.",
                description: "The server is currently unable to handle your request. Please try again in a minute.",
                link: "Retry"
            }
        ]
    </script>
    <script src="/errorPage/script.js"></script>

</body>

</html>