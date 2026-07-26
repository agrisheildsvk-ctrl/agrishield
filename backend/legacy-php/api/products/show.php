<?php
require_once '../../config/headers.php';
require_once '../../config/Database.php';

use Config\Database;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Product ID is required"]);
    exit();
}

$id = (int)$_GET['id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT p.*, c.name as category_name 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              WHERE p.id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get images
        $imgQuery = "SELECT id, image_url, is_primary FROM product_images WHERE product_id = :id";
        $imgStmt = $db->prepare($imgQuery);
        $imgStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $imgStmt->execute();
        $images = $imgStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $product['images'] = $images;

        http_response_code(200);
        echo json_encode($product);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Product not found."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
