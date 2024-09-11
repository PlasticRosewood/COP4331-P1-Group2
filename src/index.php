<?php
require_once 'controllers/AccountController.php';
// Routing for API requests

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

# Array of elements after the URL
$request_uri_chunks = explode('/', $request_uri);

# URL parsing failed, or the first part of the path was not api
# (This should never be true if the .htaccess is correct)
if(!$request_uri || $request_uri_chunks[0] != 'api') {
    http_response_code(500);
}

# Parse JSON
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

// Trim off 'api'
array_shift($request_uri_chunks);

switch ($request_uri_chunks[0]) {
    case 'contact':
        break;
    case 'auth':
        array_shift($request_uri_chunks);
        $controller = new AccountController();
        $controller->handleRequest($request_uri_chunks, $request_method, $data);
        break;
    default:
        http_response_code(400);
}

?>
