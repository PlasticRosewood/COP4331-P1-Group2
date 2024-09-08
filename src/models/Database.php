<?php

class Database {
    private $dbConnection;

    public function __construct($host, $db, $user, $pass, $charset) {
        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $this->dbConnection = new PDO($dsn, $user, $pass, $options);
    }
    
    public function query($sql, $params = []): array | bool {
        $stmt = $this->dbConnection->prepare($sql);

        if($stmt->execute($params)) {
            return $stmt->fetchAll();
        }

        return false;
    }

    public function execute($sql, $params = []): bool {
        $stmt = $this->dbConnection->prepare($sql);
        return $stmt->execute($params);
    }

}
?>
