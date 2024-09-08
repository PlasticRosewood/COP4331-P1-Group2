<?php
// Routing for API requests

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

switch ($request_uri) {
    case '/api/contacts':
        echo 'Contacts';
        break;
    case '/api/login'
        echo 'Login';
        break;
    default:
        http_response_code(400);
}

?>
