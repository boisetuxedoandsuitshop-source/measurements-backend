import { query } from '../../lib/db';
import { verifyPassword } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, password } = req.body;

    if (!password || !verifyPassword(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Missing measurement ID' });
    }

    const result = await query(
      'DELETE FROM measurements WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Measurement not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Measurement deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Delete measurement error:', error);
    return res.status(500).json({
      error: 'Failed to delete measurement',
      details: error.message,
    });
  }
}
