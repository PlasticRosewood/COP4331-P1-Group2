<?php
// Routing for API requests
require_once 'repositories/ContactRepository.php';
require_once 'repositories/UserRepository.php';
require_once 'controllers/ContactController.php';
require_once 'controllers/AccountController.php';
require_once('models/Database.php');
require_once(__DIR__ . '/../vendor/autoload.php');


$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

# Array of elements after the URL
# Trim to remove leading slash
$request_uri_chunks = explode('/', trim($request_uri, '/'));

# URL parsing failed, or the first part of the path was not api
# (This should never be true if the .htaccess is correct)
if(!$request_uri || array_shift($request_uri_chunks) != 'api') {
    http_response_code(500);
    return;
}

# Parse JSON
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

# Load .env file from root
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

# Initialize DB
$db = new Database($_ENV['DB_HOST'], $_ENV['DB_NAME'], $_ENV['DB_USER'], $_ENV['DB_PASS'], $_ENV['DB_CHARSET']);
$jwt = new TokenGenerator($_ENV['JWT_SECRET']);


switch (array_shift($request_uri_chunks)) {
    case 'contact':
        $repository = new ContactRepository($db);
        $controller = new ContactController($repository, $jwt);
        $controller->handleRequest($request_uri_chunks, $request_method, $data);
        break;
    case 'auth':
        $repository = new UserRepository($db);
        $controller = new AccountController($repository, $jwt);
        $controller->handleRequest($request_uri_chunks, $request_method, $data);
        break;
    default:
        http_response_code(400);
}

?>
