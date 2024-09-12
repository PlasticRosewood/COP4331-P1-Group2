<?php
require_once(__DIR__ . '/../models/Database.php');
require_once(__DIR__ . '/../config/db_credentials.php');
require_once(__DIR__ . '/../repositories/UserRepository.php');

class AccountController {
    private $repository;
    public function __construct(UserRepository $repository) {
        $this->repository = $repository;
        session_start();
    }

    public function handleRequest(array $request_uri_chunks, string $request_method, array $data): void {
        switch($request_uri_chunks[0]) {
            case 'login':
                switch($request_method) {
                    case 'POST':
                        $this->login($data);
                        break;
                }
                break;
            case 'register': 
                switch($request_method) {
                    case 'POST':
                        $this->register($data);
                        break;
                }
                break;
        }

    }

    public function login(array $data): void {
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(401);
            return;
        }

        if($user = $this->repository->findUserByUsername($data['username'])) {
            if (password_verify($data['password'], $user['password_hash'])) {
                $this->createSession($user['id']);
                http_response_code(200);
            } else {
                http_response_code(401);
            }
        } else {
            http_response_code(401);
        }
    }

    public function createSession(int $userId): void {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['logged_in'] = true;
        http_response_code(200);
    }

    public function register(array $data): void {
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            return;
        }

        // Check that user does not exist currently
        if($this->repository->userExists($data['username'])) {
            http_response_code(400);
            return;  
        }


        if ($this->repository->createUser($data['username'], $data['password'])) {
            http_response_code(200);
            # Automatically log in after registration
            $this->login($data);
        } else {
            http_response_code(400);
        }
    }

    public function logout(): void {
        session_unset();
        session_destroy();
    }

    public function is_authorized(int $id): bool {
        if (!isset($_SESSION['user_id'])) {
            return false;
        }

        return $_SESSION['user_id'] === $id;
    }
}
?>
