-- Database: hotel_management

-- 1. Users Table (Stores Admins, Staff, and Registered Guests)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'guest', -- e.g., 'guest', 'staff', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Room Categories (Base classification for pricing and features)
CREATE TABLE IF NOT EXISTS room_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'Standard', 'Deluxe', 'Presidential Suite'
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    amenities TEXT, -- Could store JSON or comma-separated string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms (Physical individual spaces)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES room_categories(id) ON DELETE RESTRICT,
    floor_number INTEGER,
    type VARCHAR(50),
    price DECIMAL(10, 2),
    capacity INTEGER DEFAULT 2,
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'available', -- e.g., 'available', 'occupied', 'maintenance', 'cleaning'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reservations (Bookings mapping users to rooms over time periods)
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adult_count INTEGER DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Additional Guests (Other people staying under the reservation wrapper)
CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    identification_type VARCHAR(100), -- Passport, Driver's License, etc.
    identification_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payments (Financial transactions attached to user bookings)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- e.g., 'Credit Card', 'Cash', 'PayPal', 'Stripe'
    transaction_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Services (Catalog for extra hospitality, e.g., Spa, Room Service, Laundry)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Service Orders (Logs when guests consume additional items or amenities)
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE RESTRICT,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL, -- Calculated at time of order based on service price * quantity
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'unpaid' -- 'unpaid', 'paid', 'cancelled'
);
