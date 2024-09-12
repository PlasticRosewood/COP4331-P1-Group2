<?php
trait JsonResponseTrait {
    protected function sendJsonResponse($data, $status = 200): void {
        header('Content-Type: application/json');

        http_response_code($status);

        echo(json_encode($data));
    }
}

?>
