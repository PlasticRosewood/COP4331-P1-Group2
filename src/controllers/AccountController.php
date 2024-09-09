<?php
require_once(__DIR__ . '/../models/Database.php');
require_once(__DIR__ . '/../config/db_credentials.php');

class AccountController {
    private $db;
    
    public function __construct() {
        $this->db = new Database(HOST, DB, USER, PASS, CHARSET);
        session_start();
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
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['logged_in'] = true;
        }
    }

    public function logout(): void {
        session_unset();
        session_destroy();
    }

    public function is_authorized(int $id): bool {
        if (!isset($_SESSION['user_id'])) {
        }

        return $_SESSION['user_id'] === $id;
    }
}
?>
