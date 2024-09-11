<?php
require_once 'controllers/AccountController.php';
// Routing for API requests

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

switch ($request_uri) {
    case '/api/contacts':
        break;
    case '/api/auth/login':
        $controller = new AccountController();
        switch($request_method) {
            case 'POST':
                $controller->login($data);
                break;
        }
        break;
    case '/api/auth/register':
        $controller = new AccountController();
        switch($request_method) {
            case 'POST':
                $controller->register($data);
                break;
        }
        break;
    default:
        http_response_code(400);
}

?>
