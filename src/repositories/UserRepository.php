
<?php

class UserRepository {
    private $db;
    
    public function __construct(Database $db) {
        $this->db = $db;
    }

    public function findUserByUsername(string $username): ?array {

        $stmt = 'SELECT id, username, password_hash FROM UserAccountInfo WHERE username = :username';
        $params = [
            ':username' => $username,
        ];

        $result = $this->db->run($stmt, $params);

        if($user = $result->fetch()) {
            return $user;
        } else {
            return null;
        }
    }

    public function userExists(string $username): bool {
        // Check that user does not exist currently
        $stmt = "SELECT username FROM UserAccountInfo WHERE username = :username";
        $params = [
            ':username' => $username,
        ];
        $result = $this->db->run($stmt, $params);

        return ($result->rowCount() > 0);
    }

    public function createUser(string $username, string $password): ?int {
        $stmt = 'INSERT INTO UserAccountInfo (username, password_hash) VALUES (:username, :password_hash)';
        $params = [
            ':username' => $username,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ];

        if ($this->db->run($stmt, $params)) {
            return $this->db->dbConnection->lastInsertId();
        } else {
            return null;
        }
    }
}
?>
