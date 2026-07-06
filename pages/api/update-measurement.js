import { query } from '../../lib/db';
import { verifyPassword } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, password, viewed, ...fields } = req.body;

    if (!password || !verifyPassword(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Missing measurement ID' });
    }

    // Viewed-only update (legacy)
    if (viewed !== undefined && Object.keys(fields).length === 0) {
      const r = await query(
        'UPDATE measurements SET viewed = $1 WHERE id = $2 RETURNING *',
        [viewed, id]
      );
      if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ success: true, measurement: r.rows[0] });
    }

    // Full field update
    const result = await query(
      `UPDATE measurements SET
        customer_name    = $1,
        customer_email   = $2,
        customer_phone   = $3,
        wedding_name     = $4,
        event_date       = $5,
        order_type       = $6,
        chest            = $7,
        overarm          = $8,
        mid_section      = $9,
        waist            = $10,
        outseam          = $11,
        neck             = $12,
        shirt_sleeve     = $13,
        jacket_sleeve    = $14,
        height           = $15,
        weight           = $16,
        shoe_size        = $17,
        shoe_width       = $18,
        preferred_fit    = $19,
        special_requests = $20,
        pickup_date      = $21,
        return_date      = $22
      WHERE id = $23
      RETURNING *`,
      [
        fields.customer_name   || null,
        fields.customer_email  || null,
        fields.customer_phone  || null,
        fields.wedding_name    || null,
        fields.event_date      || null,
        fields.order_type      || null,
        fields.chest           || null,
        fields.overarm         || null,
        fields.mid_section     || null,
        fields.waist           || null,
        fields.outseam         || null,
        fields.neck            || null,
        fields.shirt_sleeve    || null,
        fields.jacket_sleeve   || null,
        fields.height          || null,
        fields.weight          || null,
        fields.shoe_size       || null,
        fields.shoe_width      || null,
        fields.preferred_fit   || null,
        fields.special_requests || null,
        fields.pickup_date     || null,
        fields.return_date     || null,
        id,
      ]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'Measurement not found' });

    return res.status(200).json({ success: true, measurement: result.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ error: 'Failed to update', details: error.message });
  }
}
