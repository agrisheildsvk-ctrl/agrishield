<?php
require_once '../../config/headers.php';
require_once '../../config/Database.php';

use Config\Database;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
    $offset = ($page - 1) * $limit;

    // Filtering
    $category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
    $search = isset($_GET['search']) ? htmlspecialchars(strip_tags($_GET['search'])) : null;
    
    $whereClause = "WHERE 1=1";
    $params = [];

    if ($category_id) {
        $whereClause .= " AND p.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }
    
    if ($search) {
        $whereClause .= " AND (p.name LIKE :search OR p.description LIKE :search)";
        $params[':search'] = "%{$search}%";
    }

    $query = "SELECT p.*, c.name as category_name, 
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              $whereClause 
              ORDER BY p.created_at DESC 
              LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($query);
    
    foreach ($params as $key => &$val) {
        $stmt->bindParam($key, $val);
    }
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM products p $whereClause";
    $countStmt = $db->prepare($countQuery);
    foreach ($params as $key => &$val) {
        $countStmt->bindParam($key, $val);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    http_response_code(200);
    echo json_encode([
        "data" => $products,
        "pagination" => [
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "pages" => ceil($total / $limit)
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
