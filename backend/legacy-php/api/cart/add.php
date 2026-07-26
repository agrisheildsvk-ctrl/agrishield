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

$jwtHelper = new JwtHelper();
$token = $jwtHelper->getAuthToken();
$user = $jwtHelper->validateToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->product_id)) {
    try {
        $quantity = isset($data->quantity) ? (int)$data->quantity : 1;
        
        // Check if already in cart
        $checkQuery = "SELECT id, quantity FROM cart WHERE user_id = :user_id AND product_id = :product_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":user_id", $user->id);
        $checkStmt->bindParam(":product_id", $data->product_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
            $newQuantity = $row['quantity'] + $quantity;
            
            $updateQuery = "UPDATE cart SET quantity = :quantity WHERE id = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(":quantity", $newQuantity);
            $updateStmt->bindParam(":id", $row['id']);
            $updateStmt->execute();
            
            http_response_code(200);
            echo json_encode(["message" => "Cart updated"]);
        } else {
            $insertQuery = "INSERT INTO cart (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->bindParam(":user_id", $user->id);
            $insertStmt->bindParam(":product_id", $data->product_id);
            $insertStmt->bindParam(":quantity", $quantity);
            $insertStmt->execute();
            
            http_response_code(201);
            echo json_encode(["message" => "Added to cart"]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Product ID required"]);
}
?>
