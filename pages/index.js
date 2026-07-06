import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [wedding, setWedding] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthenticated(true);
        setPassword('');
        fetchMeasurements(1, data.token);
      } else {
        alert(data.error || 'Incorrect password');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch {}
    setAuthenticated(false);
    setToken('');
    setPassword('');
    setMeasurements([]);
  };

  const fetchMeasurements = async (pageNum = 1, overrideToken = null) => {
    setLoading(true);
    const authToken = overrideToken || token;
    try {
      const res = await fetch('/api/get-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: authToken,
          page: pageNum,
          limit: 20,
          search,
          wedding,
          sortBy,
          sortOrder,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMeasurements(data.measurements);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      } else if (res.status === 401) {
        setAuthenticated(false);
        setToken('');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to fetch measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMeasurements(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) return;

    try {
      const res = await fetch('/api/delete-measurement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token }),
      });

      if (res.ok) {
        fetchMeasurements(page);
        alert('Measurement deleted successfully');
      } else if (res.status === 401) {
        setAuthenticated(false);
        setToken('');
      } else {
        alert('Failed to delete measurement');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEventDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSaveEdit = (updated) => {
    setMeasurements(prev => prev.map(m => m.id === updated.id ? updated : m));
    setEditingMeasurement(null);
  };

  const handlePrintMeasurement = (m) => {
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>${m.customer_name} — Measurements</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;max-width:640px;color:#1a1a1a}
      h1{font-size:22px;margin:0 0 4px 0}
      .meta{font-size:13px;color:#555;margin-bottom:18px;line-height:1.7}
      .section{margin-bottom:16px;border-top:1px solid #ddd;padding-top:12px}
      .section h2{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#999;margin:0 0 10px 0}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}
      .row{font-size:13px;padding:2px 0}
      .notes{font-size:13px;line-height:1.5}
      .footer{font-size:11px;color:#aaa;margin-top:20px;border-top:1px solid #eee;padding-top:8px}
      @page{margin:0.75in}
    </style></head><body>
    <h1>${m.customer_name}</h1>
    <div class="meta">
      ${m.wedding_name ? `<strong>Wedding/Event:</strong> ${m.wedding_name}<br>` : ''}
      ${m.event_date ? `<strong>Event Date:</strong> ${new Date(m.event_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}<br>` : ''}
      ${m.order_type ? `<strong>Order Type:</strong> ${m.order_type}<br>` : ''}
      ${m.customer_email ? `<strong>Email:</strong> ${m.customer_email}<br>` : ''}
      ${m.customer_phone ? `<strong>Phone:</strong> ${m.customer_phone}<br>` : ''}
    </div>
    <div class="section"><h2>Measurements (inches)</h2><div class="grid">
      <div class="row"><strong>Chest:</strong> ${m.chest || '—'}"</div>
      <div class="row"><strong>Overarm:</strong> ${m.overarm || '—'}"</div>
      <div class="row"><strong>Mid Section:</strong> ${m.mid_section || '—'}"</div>
      <div class="row"><strong>Waist:</strong> ${m.waist || '—'}"</div>
      <div class="row"><strong>Outseam:</strong> ${m.outseam || '—'}"</div>
      <div class="row"><strong>Neck:</strong> ${m.neck || '—'}"</div>
      <div class="row"><strong>Shirt Sleeve:</strong> ${m.shirt_sleeve || '—'}"</div>
      <div class="row"><strong>Jacket Sleeve:</strong> ${m.jacket_sleeve || '—'}"</div>
      <div class="row"><strong>Height:</strong> ${m.height || '—'}</div>
      <div class="row"><strong>Weight:</strong> ${m.weight ? m.weight+' lbs' : '—'}</div>
      <div class="row"><strong>Shoe Size:</strong> ${m.shoe_size || '—'}</div>
      <div class="row"><strong>Shoe Width:</strong> ${m.shoe_width || '—'}</div>
      <div class="row"><strong>Preferred Fit:</strong> ${m.preferred_fit || '—'}</div>
    </div></div>
    ${(m.pickup_date || m.return_date) ? `<div class="section"><h2>Rental Dates</h2><div class="grid">
      <div class="row"><strong>Pickup:</strong> ${m.pickup_date || '—'}</div>
      <div class="row"><strong>Return:</strong> ${m.return_date || '—'}</div>
    </div></div>` : ''}
    ${m.special_requests ? `<div class="section"><h2>Special Requests / Notes</h2><div class="notes">${m.special_requests}</div></div>` : ''}
    <div class="footer">Submitted: ${new Date(m.submitted_at).toLocaleString()}</div>
    <script>window.onload=function(){window.print();}<\/script>
    </body></html>`);
    win.document.close();
  };

  if (!authenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h1 style={styles.loginTitle}>Boise Tuxedo</h1>
          <p style={styles.loginSubtitle}>Measurements Admin Dashboard</p>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              autoFocus
            />
            <button type="submit" style={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Measurements Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Log Out
          </button>
        </div>

        <form onSubmit={handleSearch} style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <input
            type="text"
            placeholder="Filter by wedding..."
            value={wedding}
            onChange={(e) => setWedding(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setWedding('');
              setPage(1);
            }}
            style={styles.clearButton}
          >
            Clear
          </button>
        </form>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : measurements.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No measurements found</p>
        </div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableCell}>Date Submitted</th>
                  <th style={styles.tableCell}>Name</th>
                  <th style={styles.tableCell}>Email</th>
                  <th style={styles.tableCell}>Wedding/Event</th>
                  <th style={styles.tableCell}>Event Date</th>
                  <th style={styles.tableCell}>Type</th>
                  <th style={styles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{formatDate(m.submitted_at)}</td>
                    <td style={styles.tableCell}>{m.customer_name}</td>
                    <td style={styles.tableCell}>{m.customer_email || '—'}</td>
                    <td style={styles.tableCell}>{m.wedding_name || '—'}</td>
                    <td style={styles.tableCell}>{formatEventDate(m.event_date)}</td>
                    <td style={styles.tableCell}>{m.order_type || '—'}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => setSelectedMeasurement(m)}
                        style={styles.viewButton}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditingMeasurement(m)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() => fetchMeasurements(page - 1)}
              disabled={page === 1}
              style={styles.paginationButton}
            >
              ← Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchMeasurements(page + 1)}
              disabled={page === totalPages}
              style={styles.paginationButton}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {selectedMeasurement && (
        <MeasurementModal
          measurement={selectedMeasurement}
          onClose={() => setSelectedMeasurement(null)}
          onPrint={() => handlePrintMeasurement(selectedMeasurement)}
        />
      )}

      {editingMeasurement && (
        <EditModal
          measurement={editingMeasurement}
          token={token}
          onClose={() => setEditingMeasurement(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function MeasurementModal({ measurement, onClose, onPrint }) {
  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>
          ✕
        </button>

        <h2 style={styles.modalTitle}>{measurement.customer_name}</h2>

        <div style={styles.modalSection}>
          <h3>Contact Information</h3>
          <p>
            <strong>Email:</strong> {measurement.customer_email || 'Not provided'}
          </p>
          <p>
            <strong>Phone:</strong> {measurement.customer_phone || 'Not provided'}
          </p>
          <p>
            <strong>Wedding/Event:</strong> {measurement.wedding_name || 'Not specified'}
          </p>
          <p>
            <strong>Event Date:</strong>{' '}
            {measurement.event_date
              ? new Date(measurement.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Not specified'}
          </p>
          <p>
            <strong>Order Type:</strong> {measurement.order_type || 'Not specified'}
          </p>
        </div>

        <div style={styles.modalSection}>
          <h3>Measurements (inches)</h3>
          <div style={styles.measurementGrid}>
            <MeasurementRow label="Chest" value={measurement.chest} />
            <MeasurementRow label="Overarm" value={measurement.overarm} />
            <MeasurementRow label="Mid Section" value={measurement.mid_section} />
            <MeasurementRow label="Waist" value={measurement.waist} />
            <MeasurementRow label="Outseam" value={measurement.outseam} />
            <MeasurementRow label="Neck" value={measurement.neck} />
            <MeasurementRow label="Shirt Sleeve" value={measurement.shirt_sleeve} />
            <MeasurementRow label="Jacket Sleeve" value={measurement.jacket_sleeve} />
            <MeasurementRow label="Height" value={measurement.height} />
            <MeasurementRow label="Weight (lbs)" value={measurement.weight} />
            <MeasurementRow label="Shoe Size" value={measurement.shoe_size} />
            <MeasurementRow label="Shoe Width" value={measurement.shoe_width} />
            <MeasurementRow label="Preferred Fit" value={measurement.preferred_fit} />
          </div>
        </div>

        {(measurement.pickup_date || measurement.return_date) && (
          <div style={styles.modalSection}>
            <h3>Rental Dates</h3>
            <p>
              <strong>Pickup Date:</strong> {measurement.pickup_date || 'Not specified'}
            </p>
            <p>
              <strong>Return Date:</strong> {measurement.return_date || 'Not specified'}
            </p>
          </div>
        )}

        {measurement.special_requests && (
          <div style={styles.modalSection}>
            <h3>Special Requests</h3>
            <p>{measurement.special_requests}</p>
          </div>
        )}

        <div style={styles.modalSection}>
          <p style={styles.submittedAt}>
            Submitted: {new Date(measurement.submitted_at).toLocaleString()}
          </p>
        </div>

        <div style={styles.modalActions}>
          <button onClick={onPrint} style={styles.printModalButton}>
            🖨️ Print This
          </button>
          <button onClick={onClose} style={styles.closeModalButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ measurement, token, onClose, onSave }) {
  const [form, setForm] = useState({ ...measurement });
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const toDateInput = (val) => {
    if (!val) return '';
    return String(val).slice(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/update-measurement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      });
      if (res.ok) {
        const data = await res.json();
        onSave(data.measurement);
      } else {
        alert('Failed to save changes');
      }
    } catch {
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const inp = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };
  const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '4px' };
  const lbl = { fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={{ ...styles.modalContent, maxWidth: '700px', width: '95%' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>✕</button>
        <h2 style={{ ...styles.modalTitle, marginBottom: '20px' }}>Edit: {measurement.customer_name}</h2>
        <form onSubmit={handleSubmit}>

          <div style={{ ...styles.modalSection }}>
            <h3 style={{ marginBottom: '12px' }}>Contact Information</h3>
            <div style={grid2}>
              <div style={fieldWrap}><span style={lbl}>Name *</span><input style={inp} value={form.customer_name || ''} onChange={e => set('customer_name', e.target.value)} required /></div>
              <div style={fieldWrap}><span style={lbl}>Email</span><input style={inp} type="email" value={form.customer_email || ''} onChange={e => set('customer_email', e.target.value)} /></div>
              <div style={fieldWrap}><span style={lbl}>Phone</span><input style={inp} value={form.customer_phone || ''} onChange={e => set('customer_phone', e.target.value)} /></div>
              <div style={fieldWrap}><span style={lbl}>Wedding / Event Name</span><input style={inp} value={form.wedding_name || ''} onChange={e => set('wedding_name', e.target.value)} /></div>
              <div style={fieldWrap}><span style={lbl}>Event Date</span><input style={inp} type="date" value={toDateInput(form.event_date)} onChange={e => set('event_date', e.target.value)} /></div>
              <div style={fieldWrap}><span style={lbl}>Order Type</span>
                <select style={inp} value={form.order_type || ''} onChange={e => set('order_type', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="rental">Rental</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.modalSection}>
            <h3 style={{ marginBottom: '12px' }}>Measurements (inches)</h3>
            <div style={grid2}>
              {[['chest','Chest'],['overarm','Overarm'],['mid_section','Mid Section'],['waist','Waist'],['outseam','Outseam'],['neck','Neck'],['shirt_sleeve','Shirt Sleeve'],['jacket_sleeve','Jacket Sleeve'],['height','Height'],['weight','Weight (lbs)'],['shoe_size','Shoe Size'],['shoe_width','Shoe Width'],['preferred_fit','Preferred Fit']].map(([field, label]) => (
                <div key={field} style={fieldWrap}>
                  <span style={lbl}>{label}</span>
                  <input style={inp} value={form[field] || ''} onChange={e => set(field, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div style={styles.modalSection}>
            <h3 style={{ marginBottom: '12px' }}>Rental Dates</h3>
            <div style={grid2}>
              <div style={fieldWrap}><span style={lbl}>Pickup Date</span><input style={inp} type="date" value={toDateInput(form.pickup_date)} onChange={e => set('pickup_date', e.target.value)} /></div>
              <div style={fieldWrap}><span style={lbl}>Return Date</span><input style={inp} type="date" value={toDateInput(form.return_date)} onChange={e => set('return_date', e.target.value)} /></div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Special Requests / Notes</h3>
            <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={form.special_requests || ''} onChange={e => set('special_requests', e.target.value)} />
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.closeModalButton}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...styles.printModalButton, background: saving ? '#999' : '#28a745' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MeasurementRow({ label, value }) {
  return (
    <div style={styles.measurementRow}>
      <strong>{label}:</strong> {value || '—'}
    </div>
  );
}

const styles = {
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  loginBox: {
    background: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  loginTitle: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    color: '#1a1a1a',
  },
  loginSubtitle: {
    margin: '0 0 30px 0',
    color: '#666',
    fontSize: '14px',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  passwordInput: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  loginButton: {
    padding: '12px',
    background: '#cc0000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  container: {
    minHeight: '100vh',
    background: '#fafafa',
    padding: '24px',
  },
  header: {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#1a1a1a',
  },
  logoutButton: {
    padding: '8px 16px',
    background: '#cc0000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  searchBar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  searchButton: {
    padding: '10px 20px',
    background: '#cc0000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  clearButton: {
    padding: '10px 20px',
    background: '#e0e0e0',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tableWrapper: {
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f5f5f5',
    borderBottom: '2px solid #e0e0e0',
  },
  tableCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
  },
  viewButton: {
    padding: '6px 12px',
    background: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px',
  },
  editButton: {
    padding: '6px 12px',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px',
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#cc0000',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '24px',
  },
  paginationButton: {
    padding: '8px 16px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666',
  },
  emptyState: {
    background: '#fff',
    padding: '60px 24px',
    textAlign: 'center',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#999',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '8px',
    padding: '32px',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  modalTitle: {
    margin: '0 0 24px 0',
    fontSize: '20px',
    color: '#1a1a1a',
  },
  modalSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  measurementGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  measurementRow: {
    padding: '8px 0',
    fontSize: '14px',
  },
  submittedAt: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  printModalButton: {
    padding: '10px 20px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  closeModalButton: {
    padding: '10px 20px',
    background: '#e0e0e0',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
