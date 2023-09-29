<?php

// Fix XSS (function) [use for all echos, or use the safe_echo function]
if(!function_exists("xss_fix")) {
  function xss_fix($input) {
    $output = htmlspecialchars($input, ENT_QUOTES, "UTF-8");
    $output = str_replace("/", "&#x2F;", $output);
    $output = str_replace("\\", "&#x5c;", $output);
    return $output;
  }
}

if(!function_exists("safe_echo")) {
  function safe_echo($input) {
    echo xss_fix($input);
  }
}

if(!function_exists("is_empty")) {
  function is_empty($input) {
    return empty(trim($input));
  }
}

$request_url = urldecode(ltrim($_SERVER["REQUEST_URI"], "/"));
$error_code = (isset($_SERVER["REDIRECT_STATUS"]) ? $_SERVER["REDIRECT_STATUS"] : $_SERVER["STATUS"]);
$error_code_str = "E_" . $error_code;


define("DEFAULT_ERROR_TITLE", "Oops! Something went wrong...");
define("DEFAULT_ERROR_MESSAGE", "We seem to be having some technical difficulties. Please try again later. If the issue persists, please contact support.");
define("DEFAULT_ERROR_ICON", "report");

$errors = (object) array(
  "E_403" => (object) array(
    "title" => "Forbidden",
    "message" => "You don't have permission to access " . (!is_empty($request_url) ? "<strong>\"" . xss_fix($request_url) . "\"</strong>" : "this path") . " on this server.",
    "icon" => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256z"/></svg>'
  ),
  "E_404" => (object) array(
    "title" => "Not Found",
    "message" => "The requested item " . (!is_empty($request_url) ? "<strong>\"" . xss_fix($request_url) . "\"</strong>" : "") . " could not be found on this server.",
    "icon" => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384v38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zm48 384c-79.5 0-144-64.5-144-144s64.5-144 144-144s144 64.5 144 144s-64.5 144-144 144zm0-48c13.3 0 24-10.7 24-24s-10.7-24-24-24s-24 10.7-24 24s10.7 24 24 24zM368 321.6V328c0 8.8 7.2 16 16 16s16-7.2 16-16v-6.4c0-5.3 4.3-9.6 9.6-9.6h40.5c7.7 0 13.9 6.2 13.9 13.9c0 5.2-2.9 9.9-7.4 12.3l-32 16.8c-5.3 2.8-8.6 8.2-8.6 14.2V384c0 8.8 7.2 16 16 16s16-7.2 16-16v-5.1l23.5-12.3c15.1-7.9 24.5-23.6 24.5-40.6c0-25.4-20.6-45.9-45.9-45.9H409.6c-23 0-41.6 18.6-41.6 41.6z"/></svg>'
  ),

  "E_500" => (object) array(
    "title" => "Internal Server Error"
  ),
  "E_502" => (object) array(
    "title" => "Bad Gateway"
  ),
  "E_503" => (object) array(
    "title" => "Service Unavailable"
  ),
  "E_504" => (object) array(
    "title" => "Gateway Timeout"
  )
);

$error_title = DEFAULT_ERROR_TITLE;
$error_message = DEFAULT_ERROR_MESSAGE;
$error_icon = DEFAULT_ERROR_ICON;

if(property_exists($errors, $error_code_str)) {
  $error = $errors->{$error_code_str};

  if(property_exists($error, "title") && !is_empty($error->title)) {
    $error_title = $error->title;
  }

  if(property_exists($error, "message") && !is_empty($error->message)) {
    $error_message = $error->message;
  }

  if(property_exists($error, "icon") && !is_empty($error->icon)) {
    $error_icon = $error->icon;
  }
}

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title><?php safe_echo($error_code); ?> - <?php safe_echo($error_title); ?></title>
    
    <!-- From: https://realfavicongenerator.net/ -->
    <link rel="apple-touch-icon" sizes="180x180" href="https://mauritzonline.com/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://mauritzonline.com/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="https://mauritzonline.com/favicon-16x16.png">
    <link rel="mask-icon" href="https://mauritzonline.com/safari-pinned-tab.svg" color="#5bbad5">

    <link rel="stylesheet" href="https://cdn.mauritzonline.com/sanitize_13.0.0.css">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdn.mauritzonline.com/error_page_style_v2.0.0.css">
  </head>

  <body>

    <div class="container">
      <div class="errorIcon">
        <?php echo $error_icon; ?>
      </div>
      
      <div class="errorMessage">
        <h2><strong><?php safe_echo($error_code); ?></strong> - <?php safe_echo($error_title); ?></h2>
        <p><?php echo $error_message; ?></p>
      </div>
    </div>

  </body>
</html>