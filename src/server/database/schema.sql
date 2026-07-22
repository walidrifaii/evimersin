-- EviMersin admin schema
-- Run this once against your MySQL database.

CREATE TABLE IF NOT EXISTS admin (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_username (username),
  KEY idx_admin_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  admin_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  KEY idx_refresh_admin_id (admin_id),
  KEY idx_refresh_expires_at (expires_at),
  CONSTRAINT fk_refresh_admin
    FOREIGN KEY (admin_id) REFERENCES admin(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS country (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  PRIMARY KEY (id),
  KEY idx_country_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cities (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  country_id INT NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  PRIMARY KEY (id),
  KEY idx_cities_country_id (country_id),
  KEY idx_cities_status (status),
  CONSTRAINT fk_cities_country
    FOREIGN KEY (country_id) REFERENCES country(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  position INT NOT NULL DEFAULT 0,
  icon VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_categories_status_position (status, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE categories
  MODIFY COLUMN icon VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS purpose (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  position INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_purpose_status_position (status, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  image VARCHAR(500) NULL,
  position INT NOT NULL DEFAULT 0,
  description TEXT NULL,
  price DOUBLE NOT NULL DEFAULT 0,
  discount_type VARCHAR(20) NULL COMMENT 'fixed, percentage, or NULL for no discount',
  discount_value DOUBLE NOT NULL DEFAULT 0,
  category_id INT NOT NULL,
  purpose_id INT NOT NULL,
  city_id INT NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  is_hot_deal TINYINT NOT NULL DEFAULT 0 COMMENT '1 = hot deal, 0 = not hot deal',
  is_featured TINYINT NOT NULL DEFAULT 0 COMMENT '1 = featured, 0 = not featured',
  date_created DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (id),
  KEY idx_products_status (status),
  KEY idx_products_position (position),
  KEY idx_products_category_id (category_id),
  KEY idx_products_purpose_id (purpose_id),
  KEY idx_products_city_id (city_id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_products_purpose
    FOREIGN KEY (purpose_id) REFERENCES purpose(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_products_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id INT NOT NULL AUTO_INCREMENT,
  product_id INT NOT NULL,
  image VARCHAR(500) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  PRIMARY KEY (id),
  KEY idx_product_images_product_id (product_id),
  KEY idx_product_images_status (status),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  id INT NOT NULL PRIMARY KEY DEFAULT 1,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  phone_label VARCHAR(50) NOT NULL,
  whatsapp_phone VARCHAR(30) NOT NULL,
  whatsapp_message VARCHAR(500) NOT NULL,
  instagram_url VARCHAR(500) NOT NULL,
  instagram_handle VARCHAR(100) NOT NULL,
  facebook_url VARCHAR(500) NOT NULL,
  facebook_handle VARCHAR(100) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO site_settings (
  id,
  email,
  phone,
  phone_label,
  whatsapp_phone,
  whatsapp_message,
  instagram_url,
  instagram_handle,
  facebook_url,
  facebook_handle
) VALUES (
  1,
  'info@evimersin.com',
  '+90 555 123 45 67',
  '+90 555 123 45 67',
  '905551234567',
  'Hello EviMersin, I would like to know more about your properties.',
  'https://instagram.com/evimersin',
  '@evimersin',
  'https://facebook.com/evimersin',
  'EviMersin'
);
