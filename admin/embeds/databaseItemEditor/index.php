<?php

require_once __DIR__ . "/../../scripts/init_admin.php";

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
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="../package-animation.css">

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

    <header>
        <iconify-icon icon="mdi:close" onclick="closeEditor()" width="24"></iconify-icon>
        <p class="itemID hidden">Item ID: <span></span></p>
    </header>

    <main>
        <section class="loadingContainer centered">
            <div class="loadingAnimationEllipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </section>
        <section class="errorContainer centered hidden">
            <h1>An unidentified error has occured.</h1>
        </section>
        <section class="editor hidden">
            <div class="itemEditor">
                <div class="properties"></div>
                <h2 class="errorMessage hidden"></h2>
                <div class="actions existingItem hidden">
                    <div class="passive">
                        <button class="cancel" onclick="closeEditor()">
                            <div class="icon"><iconify-icon icon="mdi:close" width="24"></iconify-icon></div>
                            <span>Cancel Changes</span>
                        </button>
                        <button class="save" onclick="updateItem()">
                            <div class="icon"><iconify-icon icon="material-symbols:save" width="24"></iconify-icon></div>
                            <span>Update Item</span>
                        </button>
                    </div>
                    <div class="danger">
                        <button class="delete" onclick="deleteItem()">
                            <div class="icon"><iconify-icon icon="mdi:trash" width="24"></iconify-icon></div>
                            <span>Delete Item</span>
                        </button>
                    </div>
                </div>
                <div class="actions newItem hidden">
                    <div class="danger">
                        <button class="cancel" onclick="closeEditor()">
                            <div class="icon"><iconify-icon icon="mdi:close" width="24"></iconify-icon></div>
                            <span>Cancel</span>
                        </button>
                    </div>
                    <div class="passive">
                        <button class="save" onclick="uploadItem()">
                            <div class="icon"><iconify-icon icon="material-symbols:upload" width="24"></iconify-icon></div>
                            <span>Upload Item</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
        <section class="progressContainer centered hidden">
            <div class="package_animation">
                <input id="package" type="checkbox" style="display: none"/>
                <div class="scene">
                    <div class="package__wrapper">
                        <div class="package__shadow"></div>
                            <div class="package">
                                <div class="package__content">
                                    <svg class="package__icon package__icon--css" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <title>CSS3</title>
                                        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"></path>
                                    </svg>
                                    <svg class="package__icon package__icon--html" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <title>HTML5</title>
                                        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"></path>
                                    </svg>
                                    <svg class="package__icon package__icon--js" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <title>JavaScript</title>
                                        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"></path>
                                    </svg>
                                </div>
                                <div class="package__side package__side--main">
                                <div class="package__flap package__flap--top">
                                <div class="package__tape package__tape--top"></div>
                                </div>
                                <div class="package__flap package__flap--bottom">
                                <div class="package__tape package__tape--bottom"></div>
                                </div>
                                <div class="package__side package__side--tabbed">
                                <div class="package__flap package__flap--top">
                                </div>
                                <div class="package__flap package__flap--bottom">
                                </div>
                                <span class="package__label package__label--shadow"></span><span class="package__label"></span>
                                </div>
                                <div class="package__side package__side--extra">
                                <div class="package__flap package__flap--top">
                                </div>
                                <div class="package__flap package__flap--bottom">
                                </div>
                                <div class="package__side package__side--flipped">
                                    <div class="package__flap package__flap--top">
                                    </div>
                                    <div class="package__flap package__flap--bottom">
                                    </div><span class="package__direction">
                                    <svg viewBox="0 0 256 512" title="long-arrow-alt-up">
                                        <path d="M88 166.059V468c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12V166.059h46.059c21.382 0 32.09-25.851 16.971-40.971l-86.059-86.059c-9.373-9.373-24.569-9.373-33.941 0l-86.059 86.059c-15.119 15.119-4.411 40.971 16.971 40.971H88z"></path>
                                    </svg><span>THIS WAY UP</span>
                                    <svg viewBox="0 0 256 512" title="long-arrow-alt-up">
                                        <path d="M88 166.059V468c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12V166.059h46.059c21.382 0 32.09-25.851 16.971-40.971l-86.059-86.059c-9.373-9.373-24.569-9.373-33.941 0l-86.059 86.059c-15.119 15.119-4.411 40.971 16.971 40.971H88z"></path>
                                    </svg></span>
                                    <img class="package__branding package__branding--shadow" src="/images/brer-mail.svg"/>
                                    <img class="package__branding" src="/images/brer-mail.svg"/>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="statusContainer">
                <h1 class="title"></h1>
                <h3 class="subtitle"></h3>
                <p class="message"></p>
                <div class="actions success hidden">
                    <div class="passive">
                        <button onclick="closeEditor()">
                            <div class="icon"><iconify-icon icon="mdi:close" width="24"></iconify-icon></div>
                            <span>Close</span>
                        </button>
                    </div>
                </div>
                <div class="actions uploadFailure hidden">
                    <div class="danger">
                        <button onclick="closeEditor()">
                            <div class="icon"><iconify-icon icon="mdi:close" width="24"></iconify-icon></div>
                            <span>Close</span>
                        </button>
                    </div>
                    <div class="passive">
                        <button onclick="uploadItem()">
                            <div class="icon"><iconify-icon icon="material-symbols:redo" width="24"></iconify-icon></div>
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
                <div class="actions updateFailure hidden">
                    <div class="danger">
                        <button onclick="closeEditor()">
                            <div class="icon"><iconify-icon icon="mdi:close" width="24"></iconify-icon></div>
                            <span>Close</span>
                        </button>
                    </div>
                    <div class="passive">
                        <button onclick="updateItem()">
                            <div class="icon"><iconify-icon icon="material-symbols:redo" width="24"></iconify-icon></div>
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
                <div class="actions deleteFailure hidden">
                    <div class="danger">
                        <button onclick="closeEditor()">
                            <div class="icon"><iconify-icon icon="mdi:close" width="24"></iconify-icon></div>
                            <span>Close</span>
                        </button>
                    </div>
                    <div class="passive">
                        <button onclick="deleteItem()">
                            <div class="icon"><iconify-icon icon="mdi:trash" width="24"></iconify-icon></div>
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <div class="overlay"></div>

    <script src="/js/global.js"></script>
    <script src="/admin/EXIF.js"></script>
    <script src="script.js"></script>

</body>

</html>