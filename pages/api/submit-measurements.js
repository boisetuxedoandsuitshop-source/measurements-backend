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
        event_date || null,
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
