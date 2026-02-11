import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#14b8a6', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics/dashboard');
      setAnalytics(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Analytics error:', err);
      
      if (err.response?.status === 401) {
        logout();
        navigate('/login?reason=session_expired');
        return;
      }
      
      if (err.response?.status === 403) {
        setError('You need organizer permissions to view analytics. Please register as an organizer or contact support.');
      } else {
        setError('Failed to load analytics: ' + (err.response?.data?.message || err.message));
      }
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `KES ${value.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container">
        <div className="alert alert-error">No analytics data available</div>
      </div>
    );
  }

  return (
    <div>
      <section className="dashboard">
        <div className="dashboard-header">
          <h1>Analytics Dashboard</h1>
          <p>Track your event performance and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="value">{analytics.totalEvents}</div>
            <div className="label">Total Events</div>
          </div>
          <div className="analytics-card">
            <div className="value">{analytics.totalAttendees}</div>
            <div className="label">Total Attendees</div>
          </div>
          <div className="analytics-card">
            <div className="value">{formatCurrency(analytics.totalRevenue || 0)}</div>
            <div className="label">Total Revenue</div>
          </div>
          <div className="analytics-card">
            <div className="value">
              {analytics.totalEvents > 0 
                ? formatCurrency(Math.round(analytics.totalRevenue / analytics.totalEvents))
                : 'KES 0'}
            </div>
            <div className="label">Avg. Revenue/Event</div>
          </div>
        </div>

        {/* Main Pie Chart - Revenue by Event */}
        <div className="chart-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h3>Revenue by Event</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={analytics.revenueByEvent || []}
                dataKey="revenue"
                nameKey="eventTitle"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ eventTitle, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(analytics.revenueByEvent || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${formatCurrency(value)} (${props.payload.attendees || 0} tickets)`,
                props.payload.eventTitle
              ]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Second Pie Chart - Monthly Sales */}
        <div className="chart-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h3>Ticket Sales by Month</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={analytics.ticketsSoldOverTime || []}
                dataKey="tickets"
                nameKey="month"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ month, percent }) => `${month}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(analytics.ticketsSoldOverTime || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value} tickets (${formatCurrency(props.payload.revenue)})`,
                props.payload.month
              ]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="table-container" style={{ marginTop: '2rem' }}>
          <div className="table-header">
            <h2>Recent Transactions</h2>
          </div>

          {analytics.recentTransactions && analytics.recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--gray)' }}>No transactions yet</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Event</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTransactions && analytics.recentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td><code style={{ background: 'var(--light)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{transaction.ticketNumber}</code></td>
                    <td>{transaction.eventTitle}</td>
                    <td>{transaction.quantity}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{formatDate(transaction.purchaseDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-cards" style={{ marginTop: '2rem' }}>
          <Link to="/organizer" className="dashboard-card">
            <div className="icon">M</div>
            <h3>Manage Events</h3>
            <p>Create or edit your events</p>
          </Link>
          <Link to="/events" className="dashboard-card">
            <div className="icon">B</div>
            <h3>Browse Events</h3>
            <p>See what other organizers are offering</p>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Analytics;
