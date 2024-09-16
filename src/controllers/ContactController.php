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
        $this->tokenGenerator = $tokenGenerator;
    }

    public function handleRequest(array $request_uri_chunks, string $request_method, ?array $data): void {
        // Everything here must be authorized with a user token.
        if (!preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'] ?? '', $matches)) {
            $this->sendJsonResponse(['error' => 'Missing auth header.'], 401);
            return;
        }

        $user_id = $this->tokenGenerator->getUserIdFromToken($matches[1]);
        if($user_id == null) {
            $this->sendJsonResponse(['error' => 'Invalid token passed.'], 401);
            return;
        }

        $request_uri = implode('/', $request_uri_chunks);

        if ($request_uri == '') {
            switch($request_method) {
            case 'GET':
                $this->getContacts($user_id);
                return;
            case 'POST':
                $this->createContact($user_id, $data);
                return;
            default:
                $this->sendJsonResponse(['error' => 'Method not allowed.'], 405);
                return;
            }
        } else if (str_starts_with($request_uri, 'search')) {
            if ($request_method == 'GET') {
                $this->searchContacts($user_id, $data);
                return;
            } else {
                $this->sendJsonResponse(['error' => 'Method not allowed.'], 405);
                return;
            }
            return;
        } else if (is_numeric($request_uri)) {
            $contact_id = intval($request_uri);
            switch($request_method) { //Note that none of these functions verify if the contact belongs to the right user
            case 'GET':
                $this->getContactById($contact_id);
                return;
            case 'PUT':
                $this->updateContact($contact_id, $data);
                return;
            case 'DELETE':
                $this->deleteContact($contact_id);
                return;
            default:
                $this->sendJsonResponse(['error' => 'Method not allowed.'], 405);
                return;
            }
        } else {
            $this->sendJsonResponse(['error' => 'Not found.'], 404);
            return;
        }
    }

    public function searchContacts(int $user_id): void {
        $query_params = [];
        parse_str($_SERVER['QUERY_STRING'], $query_params);

        $query = $query_params['query'] ?? null;

        if ($query === null) {
            $this->sendJsonResponse(['error' => "Search query term 'query' not provided"], 400);
            return;
        }

        $contacts = $this->repository->getContactsByName($user_id, $query);

        if ($contacts !== null) {
            $this->sendJsonResponse(['contacts' => $contacts], 200);
        } else {
            $this->sendJsonResponse(['error' => 'Could not search contacts'], 500);
        }
    }
    
    public function getContacts(int $user_id): void {
        try {
            $contacts = $this->repository->getContactsForId($user_id);
        } catch(PDOException $e) {
            $this->sendJsonResponse(['error' => 'Could not get contacts'], 500);
            return;
        }

        $this->sendJsonResponse(['contacts' => $contacts], 200);
    }

    public function createContact(int $user_id, ?array $data): void {
        // TODO: Accept user rating
        if ($data === null) {
            $this->sendJsonResponse(['error' => 'No data sent'], 400);
            return;
        }

        if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
            $this->sendJsonResponse(['error' => 'firstName, lastName, and email must be set'], 400);
            return;
        }

        try {
            $result = $this->repository->createContact($user_id, $data['firstName'], $data['lastName'], $data['email']);
            // TODO: Should this return the full contact?
            $this->sendJsonResponse(['id' => $result], 201);
        } catch (PDOException $e) {
            $this->sendJsonResponse(['error' => 'Could not create contact'], 500);
        }
    }

    public function getContactById(int $contact_id): void {
        $contact = $this->repository->getContactById($contact_id);

        try {
            $this->sendJsonResponse(['contact' => $contact], 200);
        } catch (PDOException $e) {
            $this->sendJsonResponse(['error' => 'Could not get contact'], 500);
        }
    }

    // Unsure of behavior when handed a null value for one of the parameters, for optional params
    public function updateContact(int $contact_id, ?array $data): void {
        if ($data === null) {
            $this->sendJsonResponse(['error' => 'No data sent'], 400);
            return;
        }

        //potential problem line here for null values, double check behavior when trying to only update one value
        if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
            $this->sendJsonResponse(['error' => 'firstName, lastName, and email must be set'], 400);
            return;
        }

        try { 
            $result = $this->repository->updateContact($contact_id, $data['firstName'], $data['lastName'], $data['email']);
            http_response_code(204);
        } catch(ContactNotFoundException $e) {
            $this->sendJsonResponse(['error' => $e->getMessage()], 400);
        } catch(PDOException $e) {
            $this->sendJsonResponse(['error' => 'Could not update contact'], 500);
        }
    }

    public function deleteContact(int $contact_id): void {
        try { 
            $result = $this->repository->deleteContact($contact_id);
            http_response_code(204);
        } catch(ContactNotFoundException $e) {
            $this->sendJsonResponse(['error' => $e->getMessage()], 400);
        } catch(PDOException $e) {
            $this->sendJsonResponse(['error' => 'Could not update contact'], 500);
        }
    }
}

?>
