<?php
trait JsonResponseTrait {
    protected function sendJson($data, $status = 200): ?array {
        header('Content-Type: application/json');

        http_response_code($status);

        return json_encode($data) ?? null;
    }
}

?>
