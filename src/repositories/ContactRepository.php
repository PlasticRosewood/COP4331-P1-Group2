<?php


class ContactRepository {
    private Database $db;

    public function __construct(Database $db) {
        $this->db = $db;
    }

    // TODO: Are we using this outside of testing?
    public function getContactsForId(int $user_id): ?array {
        $stmt = 'SELECT * FROM ContactInfo WHERE created_by_id = :user_id';
        $result = $this->db->run($stmt, ['user_id' => $user_id]);

        return $result->fetchAll();
    }
}
