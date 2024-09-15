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
                $this->getContactById($data);
                return;
            case 'PUT':
                $this->updateContact($data);
                return;
            case 'DELETE':
                $this->deleteContact($data);
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
        $contacts = $this->repository->getContactsForId($user_id);

        if ($contacts !== null) {
            $this->sendJsonResponse(['contacts' => $contacts], 200);
        } else {
            $this->sendJsonResponse(['error' => 'Could not get contacts'], 500);
        }
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

        $result = $this->repository->createContact($user_id, $data['firstName'], $data['lastName'], $data['email']);

        if ($result !== null) {
            // TODO: Should this return the full contact?
            $this->sendJsonResponse(['id' => $result], 201);
        } else {
            $this->sendJsonResponse(['error' => 'Could not create contact'], 500);
        }
    }

    public function getContactById(?array $data): void {
        if ($data === null) {
            $this->sendJsonResponse(['error' => 'No data sent'], 400);
            return;
        }

        // Not certain if the contact ID would just be stored as 'id' like the schema
        if (!isset($data['contactId'])) {
            $this->sendJsonResponse(['error' => 'contactId must be sent'], 400);
            return;
        }

        $contact = $this->repository->getContactById($data['contactId']);

        if ($contact !== null) {
            $this->sendJsonResponse(['contact' => $contact], 200);
        } else {
            $this->sendJsonResponse(['error' => 'Could not get contact'], 500);
        }
    }

    // Unsure of behavior when handed a null value for one of the parameters, for optional params
    public function updateContact(?array $data): void {
        if ($data === null) {
            $this->sendJsonResponse(['error' => 'No data sent'], 400);
            return;
        }

        //potential problem line here for null values, double check behavior when trying to only update one value
        if (!isset($data['contactId']) || !isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
            $this->sendJsonResponse(['error' => 'contactId, firstName, lastName, or email must be set'], 400);
            return;
        }

        $result = $this->repository->updateContact($data['contactId'], $data['firstName'], $data['lastName'], $data['email']);

        if ($result !== null) {
            // TODO: Should this return the full contact? - Copied comment as still may apply
            $this->sendJsonResponse(['id' => $result], 201);
        } else {
            $this->sendJsonResponse(['error' => 'Could not update contact'], 400);
        }
    }

    public function deleteContact(?array $data): void {
        if ($data === null) {
            $this->sendJsonResponse(['error' => 'No data sent'], 400);
            return;
        }

        if (!isset($data['contactId'])) {
            $this->sendJsonResponse(['error' => 'contactId must be set'], 400);
            return;
        }

        $result = $this->repository->deleteContact($data['contactId']);

        if ($result !== null) {
            // Proper response may not be exactly this
            $this->sendJsonResponse(['success' => $result], 204);
        } else {
            $this->sendJsonResponse(['error' => 'Could not delete contact'], 500);
        }
    }
}

?>
