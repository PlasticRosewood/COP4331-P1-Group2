<?php


require_once(__DIR__ . '/../../vendor/autoload.php');

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

define('ALGORITHM', 'HS512');

class TokenGenerator {
    private string $secret;

    public function __construct(string $secret) {
        $this->secret = $secret;
    }

    public function generateToken(int $userId): string {
        $issueTime = new DateTimeImmutable();
        $expirationTime = $issueTime->modify('+60 minutes');
        $serverName = "givemespace.lol";

        $data = [
            'iat' => $issueTime->getTimestamp(),
            'iss' => $serverName,
            'nbf' => $issueTime->getTimestamp(),
            'exp' => $expirationTime->getTimestamp(),
            'user_id' => $userId
        ];

        return JWT::encode($data, $this->secret, ALGORITHM);
    }

    public function getUserIdFromToken(string $token): ?int {
        try {
            $data = JWT::decode($token, new Key($this->secret), [ALGORITHM]);
            return $data->user_id;
        } catch (Exception $e) {
            // Failed to validate token
            return null;
        }
    }



}

?>
