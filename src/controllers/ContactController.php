<?php
require_once(__DIR__ . '/../repositories/ContactRepository.php');
require_once(__DIR__ . '/../traits/JsonResponseTrait.php');

class ContactController {
    use JsonResponseTrait;

    private ContactRepository $repository;
    public function __construct(ContactRepository $repository) {
        $this->repository = $repository;
    }

    public function handleRequest(array $request_uri_chunks, string $request_method, array $data): void {
        if($request_method == 'POST') {
            $contacts = $this->repository->getContactsForId($data['user_id']);
            if ($contacts != null) {
                $this->sendJsonResponse(['contacts' => $contacts], 200);
            } else {
                $this->sendJsonResponse(['error' => 'Could not get contacts'], 500);
            }

        }
    }
}

?>
