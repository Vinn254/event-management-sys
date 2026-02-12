import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Footer from '../components/Footer';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/auth/tickets');
        setTickets(response.data);
      } catch (err) {
        console.error('Tickets error:', err);
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          setError('Please log in to view your tickets');
        } else {
          setError(err.response?.data?.message || 'Failed to load tickets');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

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
        {!isAuthenticated && (
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
        )}
        {isAuthenticated && (
          <Link to="/events" className="btn btn-primary">
            Browse Events
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="container">
        <h1>My Tickets</h1>
        
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
                  >
                    Download Ticket
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
