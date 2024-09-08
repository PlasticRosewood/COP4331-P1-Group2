<?php
require_once(__DIR__ . '/../models/Database.php');
require_once(__DIR__ . '/../config/db_credentials.php');

class AccountController {
    private $db;
    
    public function __construct() {
        $this->db = new Database(HOST, DB, USER, PASS, CHARSET);
    }

    public function login(array $data): void {
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            return;
        }

        $stmt = 'SELECT id FROM UserAccountInfo WHERE username = :username AND password_hash = :password';
        $params = [
            ':username' => $data['username'],
            # TODO: handle hashing
            ':password' => $data['password']
        ];

        $stmt = $this->db->run($stmt, $params);

        if($user = $stmt->fetch()) {
            # TODO: store in PHP session
            echo $user['id'];
        }
    }
}
?>
