-- ====================================================================
-- InstantShare - Sample Seed Data for Testing & Demonstration
-- Base Reference Location: Latitude 12.914142, Longitude 77.636928 (HSR Layout, Bangalore)
-- Compatible with MySQL
-- ====================================================================

-- 1. Insert Categories
INSERT IGNORE INTO categories (id, name, active) VALUES
(1, 'Power Tools', true),
(2, 'Hand Tools', true),
(3, 'Ladders & Scaffolding', true),
(4, 'Lawn & Gardening', true),
(5, 'Cameras & Audio/Video', true),
(6, 'Camping & Outdoor Gear', true),
(7, 'Cleaning & Pressure Washers', true);

-- 2. Insert Users (Password: 'password123' hashed with Spring BCrypt)
INSERT IGNORE INTO users (id, name, email, phone, password_hash, role, status) VALUES
(1, 'Anshuman Rajawat', 'owner1@instantshare.test', '+919876543210', '$2a$10$dSRm3ON2MYri4L13rlZaIurS104k/oRYdii56SOQ6ZdfGQUeXEsmi', 'OWNER', 'ACTIVE'),
(2, 'Atul Kumar', 'owner2@instantshare.test', '+919876543211', '$2a$10$dSRm3ON2MYri4L13rlZaIurS104k/oRYdii56SOQ6ZdfGQUeXEsmi', 'OWNER', 'ACTIVE'),
(3, 'Abhimanyu Agnivanshi', 'renter@instantshare.test', '+919876543212', '$2a$10$dSRm3ON2MYri4L13rlZaIurS104k/oRYdii56SOQ6ZdfGQUeXEsmi', 'RENTER', 'ACTIVE'),
(4, 'Sharma Hardware Store', 'business@instantshare.test', '+919876543213', '$2a$10$dSRm3ON2MYri4L13rlZaIurS104k/oRYdii56SOQ6ZdfGQUeXEsmi', 'BUSINESS', 'ACTIVE');

-- 3. Insert Business Profile
INSERT IGNORE INTO business_profiles (id, user_id, business_name, description, verification_status) VALUES
(1, 4, 'Sharma Hardware & Tool Rentals', 'Trusted neighborhood hardware supply since 2012', 'VERIFIED');

-- 4. Insert Equipment Listings with Locations
-- Listing 1: Cordless Power Drill (~65m away from base 12.914142, 77.636928)
-- Delta: lat +0.00045 (~50m), lon +0.00035 (~38m) -> Distance ~63m (Matches 100m, 200m, 300m)
INSERT IGNORE INTO equipment (id, owner_user_id, category_id, title, description, price, price_unit, security_deposit, status) VALUES
(1, 1, 1, 'Bosch 18V Cordless Impact Drill with Battery & Bits', 'Heavy-duty 18V drill suitable for concrete, masonry, wood, and steel. Includes 2 batteries and full bit set.', 150.00, 'DAY', 500.00, 'ACTIVE');

INSERT IGNORE INTO locations (id, equipment_id, latitude, longitude, display_area) VALUES
(1, 1, 12.914592, 77.637278, 'Sector 1, HSR Layout (Near Park)');

-- Listing 2: 20ft Aluminum Telescopic Extension Ladder (~160m away)
-- Delta: lat -0.00115 (~128m), lon +0.00085 (~92m) -> Distance ~158m (Matches 200m, 300m; Excluded from 100m)
INSERT IGNORE INTO equipment (id, owner_user_id, category_id, title, description, price, price_unit, security_deposit, status) VALUES
(2, 2, 3, 'Heavy Duty 20ft Aluminum Telescoping Ladder', 'Compact multi-position ladder. Extends up to 20 feet. Easy to transport in a car boot.', 200.00, 'DAY', 800.00, 'ACTIVE');

INSERT IGNORE INTO locations (id, equipment_id, latitude, longitude, display_area) VALUES
(2, 2, 12.912992, 77.637778, 'Sector 1, 14th Main');

-- Listing 3: Sony Alpha Mirrorless 4K Camera (~240m away)
-- Delta: lat +0.00160 (~178m), lon -0.00140 (~152m) -> Distance ~234m (Matches 300m; Excluded from 100m & 200m)
INSERT IGNORE INTO equipment (id, owner_user_id, category_id, title, description, price, price_unit, security_deposit, status) VALUES
(3, 1, 5, 'Sony Alpha a6400 4K Camera + 18-105mm G Lens', 'Compact mirrorless camera with blazing fast autofocus. Perfect for weekend events, youtube videos, or travel.', 600.00, 'DAY', 2000.00, 'ACTIVE');

INSERT IGNORE INTO locations (id, equipment_id, latitude, longitude, display_area) VALUES
(3, 3, 12.915742, 77.635528, 'Sector 1, 9th Cross');

-- Listing 4: High-Pressure Washer 1800W (~450m away - STRICTLY OUTSIDE 300m)
-- Delta: lat +0.00320 (~355m), lon +0.00260 (~282m) -> Distance ~453m (Should NOT appear in 100m, 200m, or 300m results!)
INSERT IGNORE INTO equipment (id, owner_user_id, business_id, category_id, title, description, price, price_unit, security_deposit, status) VALUES
(4, 4, 1, 7, 'Karcher K3 High Pressure Washer 1800W', 'Ideal for car washing, patio cleaning, and exterior walls. Includes soap dispenser nozzle.', 350.00, 'DAY', 1000.00, 'ACTIVE');

INSERT IGNORE INTO locations (id, equipment_id, latitude, longitude, display_area) VALUES
(4, 4, 12.917342, 77.639528, 'Sector 2 Commercial Main Rd');
