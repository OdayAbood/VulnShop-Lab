INSERT INTO products (name, description, price_cents)
SELECT *
FROM (VALUES
  ('Wireless Mouse',    'Compact wireless mouse with USB receiver',   1999),
  ('Mechanical Keyboard', 'Tenkeyless keyboard with blue switches',   6999),
  ('USB-C Cable',       'Braided cable, 1 meter, fast charging',       899),
  ('Laptop Stand',      'Adjustable aluminium stand for laptops',     3499),
  ('Webcam 1080p',      'Full HD webcam with built-in microphone',    4599),
  ('Desk Lamp',         'LED lamp with three brightness levels',      2799)
) AS v (name, description, price_cents)
WHERE NOT EXISTS (SELECT 1 FROM products);