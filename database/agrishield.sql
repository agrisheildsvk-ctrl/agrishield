-- agrishield.sql
-- Database creation and table schemas

CREATE DATABASE IF NOT EXISTS agrishield;
USE agrishield;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `firstName` VARCHAR(100) DEFAULT NULL,
  `lastName` VARCHAR(100) DEFAULT NULL,
  `fullName` VARCHAR(200) DEFAULT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) UNIQUE DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) UNIQUE DEFAULT NULL,
  `googleId` VARCHAR(100) UNIQUE DEFAULT NULL,
  `profileImage` VARCHAR(255) DEFAULT NULL,
  `village` VARCHAR(150) DEFAULT NULL,
  `pincode` VARCHAR(20) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `role` VARCHAR(50) DEFAULT 'customer',
  `isVerified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `image` VARCHAR(255) DEFAULT NULL
);

CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `category_id` INT NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `discount_price` DECIMAL(10, 2) DEFAULT NULL,
  `description` TEXT,
  `specifications` TEXT,
  `benefits` TEXT,
  `dosage` TEXT,
  `stock` INT DEFAULT 0,
  `rating` DECIMAL(3, 2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
);

CREATE TABLE `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

CREATE TABLE `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

CREATE TABLE `wishlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `shipping_charge` DECIMAL(10, 2) DEFAULT 0,
  `gst` DECIMAL(10, 2) DEFAULT 0,
  `status` ENUM('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  `payment_method` ENUM('Razorpay', 'UPI', 'COD', 'Card', 'Net Banking') DEFAULT 'COD',
  `address_details` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `razorpay_payment_id` VARCHAR(100) DEFAULT NULL,
  `razorpay_order_id` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);

CREATE TABLE `coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_percentage` DECIMAL(5, 2) NOT NULL,
  `max_discount` DECIMAL(10, 2) DEFAULT NULL,
  `expiry_date` DATE,
  `is_active` BOOLEAN DEFAULT TRUE
);

CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` TEXT NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `author` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `newsletter` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Demo Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `image`) VALUES
(1, 'Seeds', 'seeds', 'seeds.jpg'),
(2, 'Fertilizers', 'fertilizers', 'fertilizers.jpg'),
(3, 'Pesticides', 'pesticides', 'pesticides.jpg'),
(4, 'Farm Machinery', 'farm-machinery', 'machinery.jpg');

-- Insert 12 Demo Products
INSERT INTO `products` (`id`, `name`, `sku`, `category_id`, `brand`, `price`, `discount_price`, `description`, `specifications`, `benefits`, `dosage`, `stock`, `rating`) VALUES
(1, 'Premium Tomato Seeds', 'TMT-001', 1, 'AgriPro', 150.00, 120.00, 'High yield premium tomato seeds suitable for all seasons.', 'Germination: 90%, Purity: 99%', 'High disease resistance, uniform fruit size.', 'Sow 1 seed per hole', 500, 4.5),
(2, 'Hybrid Corn Seeds', 'CRN-002', 1, 'KisanCrops', 300.00, 250.00, 'Hybrid corn seeds for high yield and drought resistance.', 'Germination: 85%, Moisture: 12%', 'Drought tolerant, pest resistant.', 'Use 5-6 kg per acre', 200, 4.2),
(3, 'Organic Spinach Seeds', 'SPN-003', 1, 'GreenLife', 50.00, 40.00, 'Fast-growing organic spinach seeds.', 'Germination: 95%, Purity: 98%', 'Rich in iron, fast harvesting.', 'Broadcast sowing', 1000, 4.8),
(4, 'Urea Fertilizer (50kg)', 'URE-004', 2, 'IFFCO', 1200.00, 1100.00, 'Nitrogen-rich urea fertilizer for all crops.', 'Nitrogen: 46%', 'Promotes green leafy growth.', 'Apply as top dressing', 100, 4.6),
(5, 'DAP Fertilizer (50kg)', 'DAP-005', 2, 'Coromandel', 1500.00, 1400.00, 'Diammonium phosphate for root development.', 'Nitrogen: 18%, Phosphorus: 46%', 'Excellent for early root development.', 'Basal application', 150, 4.7),
(6, 'Organic Compost (20kg)', 'CMP-006', 2, 'EcoAgri', 400.00, 350.00, '100% organic compost for soil enrichment.', 'Organic Matter: >30%', 'Improves soil health and water retention.', 'Mix with soil before planting', 300, 4.9),
(7, 'Neem Oil Insecticide', 'NEM-007', 3, 'BioSafe', 250.00, 200.00, 'Natural neem-based insecticide for organic farming.', 'Azadirachtin: 10000 ppm', 'Broad-spectrum pest control, eco-friendly.', '5ml per liter of water', 400, 4.4),
(8, 'Chlorpyrifos 20% EC', 'CHL-008', 3, 'AgriCare', 350.00, 300.00, 'Effective chemical pesticide for termite and borer control.', 'Active Ingredient: Chlorpyrifos 20%', 'Fast-acting, long-lasting.', '2-3ml per liter of water', 250, 4.3),
(9, 'Fungicide Powder (500g)', 'FNG-009', 3, 'PlantShield', 200.00, 180.00, 'Systemic fungicide for preventing fungal diseases.', 'Mancozeb 75% WP', 'Controls early and late blight.', '2g per liter of water', 350, 4.5),
(10, 'Battery Operated Knapsack Sprayer', 'SPR-010', 4, 'FarmTech', 2500.00, 2200.00, '16-liter battery-powered sprayer for easy application.', 'Capacity: 16L, Battery: 12V 8Ah', 'Reduces manual effort, consistent pressure.', 'Charge fully before use', 50, 4.8),
(11, 'Hand Cultivator', 'CLT-011', 4, 'AgriTools', 150.00, 120.00, 'Durable hand cultivator for loosening soil.', 'Material: High Carbon Steel', 'Ergonomic grip, rust-resistant.', 'Manual use', 500, 4.6),
(12, 'Drip Irrigation Kit (1 Acre)', 'DRP-012', 4, 'Jain Irrigation', 15000.00, 13500.00, 'Complete drip irrigation system for one acre farm.', 'Includes: Mainline, Laterals, Drippers', 'Saves water, increases yield.', 'Follow installation manual', 20, 4.9);

-- Insert primary images for products
INSERT INTO `product_images` (`product_id`, `image_url`, `is_primary`) VALUES
(1, 'tomato-seeds.jpg', TRUE),
(2, 'corn-seeds.jpg', TRUE),
(3, 'spinach-seeds.jpg', TRUE),
(4, 'urea-fertilizer.jpg', TRUE),
(5, 'dap-fertilizer.jpg', TRUE),
(6, 'organic-compost.jpg', TRUE),
(7, 'neem-oil.jpg', TRUE),
(8, 'chlorpyrifos.jpg', TRUE),
(9, 'fungicide.jpg', TRUE),
(10, 'sprayer.jpg', TRUE),
(11, 'cultivator.jpg', TRUE),
(12, 'drip-kit.jpg', TRUE);
