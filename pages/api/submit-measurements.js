import { query } from '../../lib/db';
import { sendMeasurementEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    if (!customer_name || !chest || !overarm || !mid_section || !waist || !outseam || !neck || !shirt_sleeve || !height || !weight || !shoe_size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert empty strings to null for numeric/date columns so Postgres doesn't reject them
    const num = v => (v === '' || v === null || v === undefined) ? null : v;
    const dt  = v => (v === '' || v === null || v === undefined) ? null : v;

    // Insert into database
    const result = await query(
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
    );

    const measurementId = result.rows[0].id;

    // Send email notification
    try {
      await sendMeasurementEmail(req.body);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the whole request if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Measurements submitted successfully',
      id: measurementId,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit measurements',
      details: error.message,
    });
  }
}
