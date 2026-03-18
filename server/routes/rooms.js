const express = require('express');
const db = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all rooms (public)
router.get('/', async (req, res) => {
  try {
    const rooms = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.json({ success: true, rooms: rooms.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving rooms' });
  }
});

// Get a single room
router.get('/:id', async (req, res) => {
  try {
    const room = await db.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (room.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving room' });
  }
});

// Create a room with optional image (Admin only)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  const { room_number, type, price, capacity, status } = req.body;
  if (!room_number || !type || !price) {
    return res.status(400).json({ message: 'Room number, type, and price are required' });
  }

  // Build the image URL if a file was uploaded
  const image_url = req.file
    ? `/uploads/rooms/${req.file.filename}`
    : null;

  try {
    const newRoom = await db.query(
      `INSERT INTO rooms (room_number, type, price, capacity, status, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [room_number, type, price, capacity || 2, status || 'available', image_url]
    );
    res.status(201).json(newRoom.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Room number already exists' });
    }
    res.status(500).json({ message: 'Server error creating room' });
  }
});

// Update a room with optional image (Admin only)
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  const { room_number, type, price, capacity, status } = req.body;

  try {
    // Only update image_url if a new file was uploaded
    let image_url_query;
    let params;

    if (req.file) {
      const image_url = `/uploads/rooms/${req.file.filename}`;
      image_url_query = `
        UPDATE rooms
        SET room_number = COALESCE($1, room_number),
            type        = COALESCE($2, type),
            price       = COALESCE($3, price),
            capacity    = COALESCE($4, capacity),
            status      = COALESCE($5, status),
            image_url   = $6,
            updated_at  = CURRENT_TIMESTAMP
        WHERE id = $7 RETURNING *`;
      params = [room_number, type, price, capacity, status, image_url, req.params.id];
    } else {
      image_url_query = `
        UPDATE rooms
        SET room_number = COALESCE($1, room_number),
            type        = COALESCE($2, type),
            price       = COALESCE($3, price),
            capacity    = COALESCE($4, capacity),
            status      = COALESCE($5, status),
            updated_at  = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *`;
      params = [room_number, type, price, capacity, status, req.params.id];
    }

    const updatedRoom = await db.query(image_url_query, params);

    if (updatedRoom.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(updatedRoom.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating room' });
  }
});

// Delete a room (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedRoom = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [req.params.id]);
    if (deletedRoom.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting room' });
  }
});

module.exports = router;
