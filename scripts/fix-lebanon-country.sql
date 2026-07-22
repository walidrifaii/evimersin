-- Fix cities → Lebanon (country id = 1) without deleting any data.
-- Run this once on your MySQL database (EasyPanel / phpMyAdmin / mysql CLI).

-- 1) Ensure country id 1 exists and is named Lebanon (active)
INSERT INTO country (id, name, status)
VALUES (1, 'Lebanon', 1)
ON DUPLICATE KEY UPDATE
  name = 'Lebanon',
  status = 1;

-- 2) Point every city at Lebanon (id 1) and keep them active
UPDATE cities
SET country_id = 1,
    status = 1;

-- 3) Keep other country rows (no delete), but mark them inactive
UPDATE country
SET status = 0
WHERE id <> 1;

-- Optional checks:
-- SELECT id, name, status FROM country ORDER BY id;
-- SELECT id, name, country_id, status FROM cities ORDER BY id;
-- SELECT COUNT(*) AS products_kept FROM products;
