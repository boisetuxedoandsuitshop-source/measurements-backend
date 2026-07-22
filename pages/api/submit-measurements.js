import { query } from '../../lib/db';
import { sendMeasurementEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    customer_name,
    customer_email,
    customer_phone,
    wedding_name,
    order_type,
    chest,
    overarm,
    mid_section,
    waist,
    outseam,
    neck,
    shirt_sleeve,
    height,
    weight,
    shoe_size,
    jacket_sleeve,
    shoe_width,
    preferred_fit,
    special_requests,
    pickup_date,
    return_date,
    event_date,
  } = req.body;

  // Validate required fields
  if (!customer_name || !customer_phone || !height || !weight) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const num = v => (v === '' || v === null || v === undefined) ? null : v;
  const dt  = v => (v === '' || v === null || v === undefined) ? null : v;

  // Run DB insert and email in parallel, independently
  const [dbResult, emailResult] = await Promise.allSettled([
    query(
      `INSERT INTO measurements (
        customer_name, customer_email, customer_phone, wedding_name, order_type,
        chest, overarm, mid_section, waist, outseam, neck, shirt_sleeve, height,
        weight, shoe_size, jacket_sleeve, shoe_width, preferred_fit, special_requests,
        pickup_date, return_date, event_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING id`,
      [
        customer_name,
        customer_email        || null,
        customer_phone        || null,
        wedding_name          || null,
        order_type            || null,
        num(chest),
        num(overarm),
        num(mid_section),
        num(waist),
        num(outseam),
        num(neck),
        num(shirt_sleeve),
        height                || null,
        num(weight),
        num(shoe_size),
        num(jacket_sleeve),
        shoe_width            || null,
        preferred_fit         || null,
        special_requests      || null,
        dt(pickup_date),
        dt(return_date),
        dt(event_date),
      ]
    ),
    sendMeasurementEmail(req.body),
  ]);

  if (dbResult.status === 'rejected') {
    console.error('Database error:', dbResult.reason);
  }
  if (emailResult.status === 'rejected') {
    console.error('Email error:', emailResult.reason);
  }

  // If DB failed entirely, return 500 — but email was still attempted
  if (dbResult.status === 'rejected') {
    return res.status(500).json({
      error: 'Failed to save measurements to database',
      details: dbResult.reason?.message,
      email_sent: emailResult.status === 'fulfilled',
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Measurements submitted successfully',
    id: dbResult.value.rows[0].id,
  });
}
