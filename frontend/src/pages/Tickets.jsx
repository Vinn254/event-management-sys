import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Footer from '../components/Footer';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSample, setIsSample] = useState(false);
  const [sampleMessage, setSampleMessage] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/auth/tickets');
        // Handle new response format with isSample flag
        if (Array.isArray(response.data)) {
          setTickets(response.data);
        } else if (response.data.tickets) {
          setTickets(response.data.tickets);
          if (response.data.isSample) {
            setIsSample(true);
            setSampleMessage(response.data.message || '');
          }
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.error('Tickets error:', err);
        
        const errorCode = err.response?.data?.code;
        
        // Check for token-related errors (mock database reset, expired token)
        if (errorCode === 'TOKEN_INVALID' || errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED') {
          // Mock database reset - show sample tickets
          showSampleTickets();
        } else if (err.response?.status === 401) {
          // 401 error - show sample tickets (mock database reset)
          showSampleTickets();
        } else {
          setError(err.response?.data?.message || 'Failed to load tickets');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const showSampleTickets = () => {
    // Show sample tickets
    const sampleTickets = [
      {
        id: 'sample-1',
        ticketNumber: 'SAMPLE-TKT-001',
        eventTitle: 'Tech Conference 2024',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        eventTime: '09:00',
        eventLocation: 'Nairobi Convention Center',
        quantity: 2,
        totalAmount: 3000,
        receiptNumber: 'SAMPLE-RCPT-001',
        status: 'confirmed',
        isSample: true
      },
      {
        id: 'sample-2',
        ticketNumber: 'SAMPLE-TKT-002',
        eventTitle: 'Summer Music Festival',
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        eventTime: '16:00',
        eventLocation: 'Kasarani Stadium',
        quantity: 4,
        totalAmount: 8000,
        receiptNumber: 'SAMPLE-RCPT-002',
        status: 'confirmed',
        isSample: true
      }
    ];
    
    setTickets(sampleTickets);
    setIsSample(true);
    setSampleMessage('Sample tickets. Purchase real tickets to see your actual bookings.');
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

  const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    return currencyFormatter.format(amount);
  };

  const downloadTicket = async (ticketNumber) => {
    try {
      const resp = await api.get(`/api/payments/ticket/${ticketNumber}`, { responseType: 'blob' });
      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticketNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download ticket failed', err);
      alert('Failed to download ticket. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Refresh Page
          </button>
          <Link to="/events" className="btn btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container">
        <h1>My Tickets</h1>
        
        {isSample && sampleMessage && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            {sampleMessage}
          </div>
        )}
        
        {tickets.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any tickets yet.</p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket, index) => (
              <div key={ticket.id || ticket.ticketNumber || index} className="ticket-card">
                <div className="ticket-header">
                  <span className="ticket-number">{ticket.ticketNumber}</span>
                  <span className="ticket-status">{ticket.status || 'confirmed'}</span>
                  {ticket.isSample && <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>Sample</span>}
                </div>
                <div className="ticket-body">
                  <h3>{ticket.eventTitle || 'Event'}</h3>
                  <p><strong>Date:</strong> {ticket.eventDate ? formatDate(ticket.eventDate) : 'N/A'}</p>
                  <p><strong>Time:</strong> {ticket.eventTime || 'N/A'}</p>
                  <p><strong>Location:</strong> {ticket.eventLocation || 'N/A'}</p>
                  <p><strong>Quantity:</strong> {ticket.quantity}</p>
                  <p><strong>Total Paid:</strong> {formatCurrency(ticket.totalAmount)}</p>
                  <p><strong>Receipt #:</strong> {ticket.receiptNumber}</p>
                </div>
                <div className="ticket-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => downloadTicket(ticket.ticketNumber)}
                    disabled={ticket.isSample}
                    title={ticket.isSample ? 'Sample tickets cannot be downloaded' : ''}
                  >
                    {ticket.isSample ? 'Sample Only' : 'Download Ticket'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tickets;
