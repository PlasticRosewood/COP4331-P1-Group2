<?php
require_once(__DIR__ . '/../repositories/ContactRepository.php');
require_once(__DIR__ . '/../traits/JsonResponseTrait.php');
require_once(__DIR__ . '/../utils/TokenGenerator.php');

class ContactController {
    use JsonResponseTrait;

    private ContactRepository $repository;
    private TokenGenerator $tokenGenerator;

    public function __construct(ContactRepository $repository, TokenGenerator $tokenGenerator) {
        $this->repository = $repository;
    }

    public function handleRequest(array $request_uri_chunks, string $request_method, array $data): void {
        // Everything here must be authorized with a user token.
        if (!preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            $this->sendJsonResponse(['error' => 'Missing auth header.']);
        }

        $user_id = $this->tokenGenerator->getUserIdFromToken($matches[1]);
        if($data == null) {
            $this->sendJsonResponse(['error' => 'Invalid token passed.']);
        }

        if($request_method == 'POST') {
            $contacts = $this->repository->getContactsForId($user_id);
            if ($contacts != null) {
                $this->sendJsonResponse(['contacts' => $contacts], 200);
            } else {
                $this->sendJsonResponse(['error' => 'Could not get contacts'], 500);
            }

        }
    }
}

?>
