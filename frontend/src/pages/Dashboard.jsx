import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user } = useAuth();
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
        setError('Failed to load tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalSpent = () => {
    return tickets.reduce((sum, ticket) => sum + (ticket.totalAmount || 0), 0);
  };

  return (
    <div>
      <section className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p>Manage your tickets and explore new events</p>
        </div>

        <div className="dashboard-cards">
          <Link to="/events" className="dashboard-card">
            <div className="icon">B</div>
            <h3>Browse Events</h3>
            <p>Discover amazing events happening near you</p>
          </Link>

          <div className="dashboard-card">
            <div className="icon">T</div>
            <h3>My Tickets</h3>
            <p>You have {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="dashboard-card">
            <div className="icon">$</div>
            <h3>Total Spent</h3>
            <p>KES {calculateTotalSpent().toLocaleString()}</p>
          </div>

          <Link to="/profile" className="dashboard-card">
            <div className="icon">S</div>
            <h3>Profile Settings</h3>
            <p>Update your account information</p>
          </Link>
        </div>

        {/* Tickets Section */}
        <div className="table-container" style={{ marginTop: '2rem' }}>
          <div className="table-header">
            <h2>My Tickets</h2>
            <Link to="/events" className="btn btn-primary btn-sm">
              Book More Events
            </Link>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <h3>No Tickets Yet</h3>
              <p>You haven't booked any events yet.</p>
              <Link to="/events" className="btn btn-primary">
                Explore Events
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Ticket #</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      {ticket.eventId?.title || 'Event'}
                      <br />
                      <small style={{ color: 'var(--gray)' }}>
                        {ticket.eventId && formatDate(ticket.eventId.date)}
                      </small>
                    </td>
                    <td>
                      <code style={{ 
                        background: 'var(--light)', 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {ticket.ticketNumber}
                      </code>
                    </td>
                    <td>{ticket.quantity}</td>
                    <td>KES {ticket.totalAmount?.toLocaleString()}</td>
                    <td>{formatDate(ticket.purchaseDate)}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          window.open(`https://event-management-sys-63du.onrender.com/api/payments/ticket/${ticket.ticketNumber}`, '_blank');
                        }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Transactions */}
        {tickets.length > 0 && (
          <div className="table-container" style={{ marginTop: '2rem' }}>
            <div className="table-header">
              <h2>Transaction History</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <code style={{ 
                        background: 'var(--light)', 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {ticket.receiptNumber}
                      </code>
                    </td>
                    <td>KES {ticket.totalAmount?.toLocaleString()}</td>
                    <td>{ticket.paymentMethod}</td>
                    <td>
                      <span className="status-badge status-confirmed">Confirmed</span>
                    </td>
                    <td>{formatDate(ticket.purchaseDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
