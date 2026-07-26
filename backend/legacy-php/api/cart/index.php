<?php
require_once '../../config/headers.php';
require_once '../../config/Database.php';
require_once '../../config/JwtHelper.php';

use Config\Database;
use Config\JwtHelper;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

try {
    $query = "SELECT c.id as cart_id, c.quantity, p.*, 
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image 
              FROM cart c 
              JOIN products p ON c.product_id = p.id 
              WHERE c.user_id = :user_id";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user->id);
    $stmt->execute();
    
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($cartItems);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
