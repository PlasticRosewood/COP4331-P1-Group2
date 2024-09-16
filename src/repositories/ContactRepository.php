<?php

class ContactNotFoundException extends Exception {}

class ContactRepository {
    private Database $db;

    public function __construct(Database $db) {
        $this->db = $db;
    }

    public function getContactsForId(int $user_id): array {
        $stmt = 'SELECT * FROM ContactInfo WHERE created_by_id = :user_id';

        $result = $this->db->run($stmt, ['user_id' => $user_id]);

        $contacts = $result->fetchAll();

        return $contacts;
    }

    // May need to create seperate functions for first and last name if LIKE emptyString returns all contacts
    public function getContactsByName(int $user_id, string $query): ?array {
        $stmt = 'SELECT * FROM ContactInfo WHERE created_by_id = :user_id 
            AND (first_name LIKE :first_name OR last_name LIKE :last_name OR email LIKE :email)';

        $params = [
            ':user_id' => $user_id,
            // Need to do this three times 
            // because PDO can't bind the same parameter multiple times...
            ':first_name' => $query . '%',
            ':last_name' => $query . '%',
            ':email' => $query . '%',
        ];

        try {
            $result = $this->db->run($stmt, $params);
        } catch (PDOException $e) {
            return null;
        }

        return $result->fetchAll();
    }

    public function getContactById(int $contact_id): array {
        $stmt = 'SELECT contact_id, first_name, last_name, email FROM ContactInfo WHERE contact_id = :contact_id';

        $result = $this->db->run($stmt, ['contact_id' => $contact_id]);

        $contact = $result->fetch();
        if(!$contact) {
            throw new ContactNotFoundException("Contact with ID $contact_id not found");
        }

        return $contact;
    }

    public function createContact(int $created_by_id, string $first_name, string $last_name, string $email): ?int {
        $stmt = 'INSERT INTO ContactInfo (created_by_id, first_name, last_name, email) 
            VALUES (:created_by_id, :first_name, :last_name, :email)';

        $params = [
            ':created_by_id' => $created_by_id,
            ':first_name' => $first_name,
            ':last_name' => $last_name,
            ':email' => $email,
        ];

        $result = $this->db->run($stmt, $params);
        return $this->db->dbConnection->lastInsertId();
    }

    public function checkUserIdOwnsContact(int $user_id, int $contact_id): bool {
        $stmt = 'SELECT created_by_id FROM ContactInfo WHERE contact_id = :contact_id';

        $result = $this->db->run($stmt, ['contact_id' => $contact_id]);

        $contact = $result->fetch();
        if(!$contact) {
            throw new ContactNotFoundException("Contact with ID $contact_id not found");
        }

        return ($contact['created_by_id'] === $user_id);
    }

    // Assuming this function can only be called on a contact accessible by the user, otherwise ID check needed
    public function updateContact(int $contact_id, string $first_name, string $last_name, string $email): void {
        $stmt = 'UPDATE ContactInfo SET first_name = :first_name, last_name = :last_name, email = :email 
            WHERE contact_id = :contact_id';

        $params = [
            ':contact_id' => $contact_id,
            ':first_name' => $first_name,
            ':last_name' => $last_name,
            ':email' => $email,
        ];

        $result = $this->db->run($stmt, $params);

        if ($result->rowCount() == 0) {
            throw new ContactNotFoundException("Contact with ID $contact_id not found");
        }
    }

    // Assuming this function can only be called on a contact accessible by the user, otherwise ID check needed
    public function deleteContact(int $contact_id): void {
        $stmt = 'DELETE FROM ContactInfo WHERE contact_id = :contact_id';

        $result = $this->db->run($stmt, ['contact_id' => $contact_id]);

        if ($result->rowCount() == 0) {
            throw new ContactNotFoundException("Contact with ID $contact_id not found");
        }
    }
}
