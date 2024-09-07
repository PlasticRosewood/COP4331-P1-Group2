<?php
// Routing for API requests

$request_uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

switch ($request_uri[1]) {
    case 'contacts':        
        echo 'Contacts';
        break;
    default:
        http_response_code(400);
}


?>
