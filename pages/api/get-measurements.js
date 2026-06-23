import { query } from '../../lib/db';
import { verifyPassword } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For POST requests, verify password is in body
    // For GET requests, verify password is in query params
    const password = req.method === 'POST' ? req.body.password : req.query.password;

    if (!password || !verifyPassword(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'submitted_at',
      sortOrder = 'DESC',
      wedding = '',
    } = req.method === 'POST' ? req.body : req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (customer_name ILIKE $${params.length} OR customer_email ILIKE $${params.length})`;
    }

    if (wedding) {
      params.push(`%${wedding}%`);
      whereClause += ` AND wedding_name ILIKE $${params.length}`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM measurements WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get measurements
    const allowedSortBy = ['submitted_at', 'customer_name', 'wedding_name', 'id'];
    const sanitizedSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'submitted_at';
    const sanitizedSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT * FROM measurements
       WHERE ${whereClause}
       ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      measurements: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    return res.status(500).json({
      error: 'Failed to fetch measurements',
      details: error.message,
    });
  }
}
