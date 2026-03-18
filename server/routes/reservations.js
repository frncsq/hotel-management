const express = require('express');
const db = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get reservations (Admin sees all, User sees theirs)
router.get('/', verifyToken, async (req, res) => {
  try {
    let reservations;
    if (req.user.role === 'admin') {
      reservations = await db.query(`
        SELECT r.*, rm.room_number, rm.type, rm.image_url, u.name as guest_name 
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
    } else {
      reservations = await db.query(`
        SELECT r.*, rm.room_number, rm.type, rm.image_url 
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `, [req.user.id]);
    }
    res.json(reservations.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving reservations' });
  }
});

// Get a single reservation
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const reservation = await db.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (reservation.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if user is admin or the owner of the reservation
    if (req.user.role !== 'admin' && reservation.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view this reservation' });
    }

    res.json(reservation.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving reservation' });
  }
});

// Create a reservation
router.post('/', verifyToken, async (req, res) => {
  const { room_id, check_in_date, check_out_date, total_price } = req.body;
  if (!room_id || !check_in_date || !check_out_date || !total_price) {
    return res.status(400).json({ message: 'Missing required reservation fields' });
  }

  // Basic check for overlapping reservations (Room availability within dates)
  try {
    const overlapping = await db.query(`
      SELECT * FROM reservations 
      WHERE room_id = $1 
      AND status NOT IN ('cancelled')
      AND (
        (check_in_date <= $2 AND check_out_date > $2) OR
        (check_in_date < $3 AND check_out_date >= $3) OR
        ($2 <= check_in_date AND $3 >= check_out_date)
      )
    `, [room_id, check_in_date, check_out_date]);

    if (overlapping.rows.length > 0) {
      return res.status(409).json({ message: 'Room is not available for requested dates' });
    }

    const newRes = await db.query(
      `INSERT INTO reservations (user_id, room_id, check_in_date, check_out_date, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [req.user.id, room_id, check_in_date, check_out_date, total_price]
    );

    res.status(201).json(newRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
});

// Update reservation status (Admin/Staff only)
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    const updated = await db.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating reservation' });
  }
});

// Cancel a reservation (User cancelling their own out of admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reservation = await db.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    
    if (reservation.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if user is admin or the owner of the reservation
    if (req.user.role !== 'admin' && reservation.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to cancel this reservation' });
    }

    const cancelledRes = await db.query(
      "UPDATE reservations SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json({ message: 'Reservation cancelled successfully', reservation: cancelledRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  }
});

module.exports = router;
