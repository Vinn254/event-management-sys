import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Footer from '../components/Footer';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/auth/tickets');
        setTickets(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tickets');
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
        <Link to="/events" className="btn btn-primary">
          Browse Events
        </Link>
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
              <div key={index} className="ticket-card">
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
                  <p><strong>Total Paid:</strong> KES {ticket.totalAmount?.toLocaleString() || '0'}</p>
                  <p><strong>Receipt #:</strong> {ticket.receiptNumber}</p>
                </div>
                <div className="ticket-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => window.open(`https://event-management-sys-63du.onrender.com/api/payments/ticket/${ticket.ticketNumber}`, '_blank')}
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
