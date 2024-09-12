<?php
require_once(__DIR__ . '/../repositories/UserRepository.php');
require_once(__DIR__ . '/../traits/JsonResponseTrait.php');
require_once(__DIR__ . '/../utils/TokenGenerator.php');

class AccountController {
    use JsonResponseTrait;

    private UserRepository $repository;
    private TokenGenerator $tokenGenerator;

    public function __construct(UserRepository $repository, TokenGenerator $tokenGenerator) {
        $this->repository = $repository;
        $this->tokenGenerator = $tokenGenerator;
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
                $token = $this->tokenGenerator->generateToken($user['id']);
                $this->sendJsonResponse(['token' => $token], 200);
            } else {
                $this->sendJsonResponse(['error' => 'Incorrect username and password combination.'], 401);
            }
        } else {
            $this->sendJsonResponse(['error' => 'Could not find user.'], 401);
        }
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
}
?>
