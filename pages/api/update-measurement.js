import { query } from '../../lib/db';
import { verifyPassword } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, password, viewed } = req.body;

    if (!password || !verifyPassword(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Missing measurement ID' });
    }

    const result = await query(
      'UPDATE measurements SET viewed = $1 WHERE id = $2 RETURNING *',
      [viewed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Measurement not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Measurement updated successfully',
      measurement: result.rows[0],
    });
  } catch (error) {
    console.error('Update measurement error:', error);
    return res.status(500).json({
      error: 'Failed to update measurement',
      details: error.message,
    });
  }
}
