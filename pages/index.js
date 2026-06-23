import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [wedding, setWedding] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/get-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, page: 1, limit: 20 }),
      });

      if (res.ok) {
        setAuthenticated(true);
        fetchMeasurements(1);
      } else {
        alert('Incorrect password');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const fetchMeasurements = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
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
        body: JSON.stringify({ id, password }),
      });

      if (res.ok) {
        fetchMeasurements(page);
        alert('Measurement deleted successfully');
      } else if (res.status === 401) {
        setAuthenticated(false);
      } else {
        alert('Failed to delete measurement');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const handlePrint = () => {
    window.print();
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
          <button onClick={handlePrint} style={styles.printButton}>
            🖨️ Print
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
                  <th style={styles.tableCell}>Wedding</th>
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
                    <td style={styles.tableCell}>{m.order_type || '—'}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => setSelectedMeasurement(m)}
                        style={styles.viewButton}
                      >
                        View
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
        />
      )}
    </div>
  );
}

function MeasurementModal({ measurement, onClose }) {
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
          <button onClick={() => window.print()} style={styles.printModalButton}>
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
  printButton: {
    padding: '8px 16px',
    background: '#1a1a1a',
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
