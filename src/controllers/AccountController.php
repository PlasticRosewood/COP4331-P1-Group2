<?php
require_once(__DIR__ . '/../models/Database.php');
require_once(__DIR__ . '/../config/db_credentials.php');
require_once(__DIR__ . '/../repositories/UserRepository.php');
require_once(__DIR__ . '/../traits/JsonResponseTrait.php');

class AccountController {
    use JsonResponseTrait;

    private UserRepository $repository;
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
            $this->sendJsonResponse(['error' => 'Username and password must be set'], 401);
            return;
        }

        if($user = $this->repository->findUserByUsername($data['username'])) {
            if (password_verify($data['password'], $user['password_hash'])) {
                # TODO: Either send the User ID or figure out JWTs..
                $this->sendJsonResponse(['user_id' => $user['id']], 200);
            } else {
                $this->sendJsonResponse(['error' => 'Incorrect username and password combination.'], 401);
            }
        } else {
            $this->sendJsonResponse(['error' => 'Could not find user.'], 401);
        }
    }

    public function createSession(int $userId): void {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['logged_in'] = true;
    }

    public function register(array $data): void {
        if (!isset($data['username']) || !isset($data['password'])) {
            $this->sendJsonResponse(['error' => 'Username and password must be set'], 400);
            return;
        }

        // Check that user does not exist currently
        if($this->repository->userExists($data['username'])) {
            $this->sendJsonResponse(['error' => 'Username already exists.'], 400);
            return;  
        }


        if ($this->repository->createUser($data['username'], $data['password'])) {
            http_response_code(200);
            # Automatically log in after registration
            $this->login($data);
        } else {
            $this->sendJsonResponse(['error' => 'Failed to create user.'], 500);
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
