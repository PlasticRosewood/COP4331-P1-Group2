<?php

class ContactRepository {
    private Database $db;

    public function __construct(Database $db) {
        $this->db = $db;
    }

    public function getContactsForId(int $user_id): ?array {
        $stmt = 'SELECT * FROM ContactInfo WHERE created_by_id = :user_id';

        try {
            $result = $this->db->run($stmt, ['user_id' => $user_id]);
        } catch (PDOException $e) {
            return null;
        }

        $contacts = $result->fetchAll();

        return $contacts;
    }
    
    // May need to create seperate functions for first and last name if LIKE emptyString returns all contacts
    public function getContactsByName(int $user_id, string $query): ?array {
        $stmt = 'SELECT * FROM ContactInfo WHERE created_by_id = :user_id 
            AND (first_name LIKE :searched_first_name% OR last_name LIKE :searched_last_name%)';

        $params = [
            ':user_id' => $user_id,
            ':searched_first_name' => $query,
            ':searched_last_name' => $query,
        ];

        try {
            $result = $this->db->run($stmt, $params);
        } catch (PDOException $e) {
            return null;
        }

        return $result->fetchAll();
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

        try {
            $result = $this->db->run($stmt, $params);
            return $this->db->dbConnection->lastInsertId();
        } catch (PDOException $e) {
            return null;
        }
    }

    // Assuming this function can only be called on a contact accessible by the user, otherwise ID check needed
    public function updateContact(int $contact_id, string $first_name, string $last_name, string $email): bool {
        $stmt = 'UPDATE ContactInfo SET first_name = :first_name, last_name = :last_name, email = :email 
            WHERE contact_id = :contact_id';

        $params = [
            ':contact_id' => $contact_id,
            ':first_name' => $first_name,
            ':last_name' => $last_name,
            ':email' => $email,
        ];

        try {
            $result = $this->db->run($stmt, $params);
        } catch (PDOException $e) {
            return false;
        }

        return true;
    }

    // Assuming this function can only be called on a contact accessible by the user, otherwise ID check needed
    public function deleteContact(int $contact_id): bool {
        $stmt = 'DELETE FROM ContactInfo WHERE contact_id = :contact_id';

        try {
            $result = $this->db->run($stmt, ['contact_id' => $contact_id]);
        } catch (PDOException $e) {
            return false;
        }

        return true;
    }
}
