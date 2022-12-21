<?php

// Fix XSS (function) [use for all echos, or use the safe_echo function]
if(!function_exists("xss_fix")) {
  function xss_fix($input) {
    $output = filter_var(htmlspecialchars($input, ENT_QUOTES, "UTF-8"), FILTER_SANITIZE_STRING);
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
    "icon" => "do_not_disturb_on"
  ),
  "E_404" => (object) array(
    "title" => "Not Found",
    "message" => "The requested item " . (!is_empty($request_url) ? "<strong>\"" . xss_fix($request_url) . "\"</strong>" : "") . " could not be found on this server.",
    "icon" => "find_in_page"
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

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Titillium+Web:400,600,700" rel="stylesheet" type="text/css">

    <link rel="stylesheet" href="https://cdn.mauritzonline.com/error_page_style.css">
  </head>

  <body>

    <div class="container">
      <div class="centered" style="width: 90%;">

        <div class="error_cont">
          <div class="error_icon">
            <i class="centered material-icons"><?php safe_echo($error_icon); ?></i>
          </div>
          
          <div class="error_message">
            <h2 class="nmt"><strong><?php safe_echo($error_code); ?></strong> - <?php safe_echo($error_title); ?></h2>
            <p class="nm"><?php echo $error_message; ?></p>
          </div>
        </div>

      </div>
    </div>

  </body>
</html>