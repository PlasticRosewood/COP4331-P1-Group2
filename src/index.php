<?php
// Routing for API requests
require_once 'controllers/AccountController.php';
require_once('models/Database.php');
require_once('config/db_credentials.php');

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

# Array of elements after the URL
# Trim to remove leading slash
$request_uri_chunks = explode('/', trim($request_uri, '/'));

# URL parsing failed, or the first part of the path was not api
# (This should never be true if the .htaccess is correct)
if(!$request_uri || array_shift($request_uri_chunks) != 'api') {
    http_response_code(500);
}

# Parse JSON
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

# Initialize DB
$db = new Database(HOST, DB, USER, PASS, CHARSET);


switch (array_shift($request_uri_chunks)) {
    case 'contact':
        break;
    case 'auth':
        $repository = new UserRepository($db);
        $controller = new AccountController($repository);
        $controller->handleRequest($request_uri_chunks, $request_method, $data);
        break;
    default:
        http_response_code(400);
}

?>
