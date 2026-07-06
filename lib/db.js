import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database error', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        wedding_name VARCHAR(255),
        order_type VARCHAR(50),
        chest NUMERIC(5,2),
        overarm NUMERIC(5,2),
        mid_section NUMERIC(5,2),
        waist NUMERIC(5,2),
        outseam NUMERIC(5,2),
        neck NUMERIC(5,2),
        shirt_sleeve NUMERIC(5,2),
        height VARCHAR(20),
        weight INTEGER,
        shoe_size NUMERIC(5,2),
        jacket_sleeve NUMERIC(5,2),
        shoe_width VARCHAR(50),
        preferred_fit VARCHAR(50),
        special_requests TEXT,
        pickup_date DATE,
        return_date DATE,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        viewed BOOLEAN DEFAULT FALSE
      );

      CREATE INDEX IF NOT EXISTS idx_wedding_name ON measurements(wedding_name);
      CREATE INDEX IF NOT EXISTS idx_customer_email ON measurements(customer_email);
      CREATE INDEX IF NOT EXISTS idx_submitted_at ON measurements(submitted_at DESC);
    `);
    // Add columns introduced after initial schema (safe to re-run)
    await query(`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS event_date DATE;`);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error', error);
  }
}

export default pool;
