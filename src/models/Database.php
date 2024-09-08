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
    
    public function run($sql, $params = []): Generator {
        $stmt = $this->dbConnection->prepare($sql);

        $stmt->execute($params);

        return $stmt;
    }
}
?>
