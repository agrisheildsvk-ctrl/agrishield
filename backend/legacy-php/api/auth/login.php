<?php
require_once '../../config/headers.php';
require_once '../../config/Database.php';
require_once '../../config/JwtHelper.php';

use Config\Database;
use Config\JwtHelper;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$jwtHelper = new JwtHelper();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        $query = "SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 0,1";
        $stmt = $db->prepare($query);

        $email = htmlspecialchars(strip_tags($data->email));
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $id = $row['id'];
            $name = $row['name'];
            $hashed_password = $row['password'];
            $role = $row['role'];

            if (password_verify($data->password, $hashed_password)) {
                $token = $jwtHelper->generateToken($id, $role);

                http_response_code(200);
                echo json_encode([
                    "message" => "Successful login.",
                    "token" => $token,
                    "user" => [
                        "id" => $id,
                        "name" => $name,
                        "email" => $email,
                        "role" => $role
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Login failed. Incorrect password."]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Login failed. User not found."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>
