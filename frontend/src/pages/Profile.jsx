import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/auth/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      localStorage.setItem('user', JSON.stringify(response.data));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/auth/profile',
        { password: passwordData.newPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Profile Settings</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Profile Info */}
          <div className="form-container" style={{ marginBottom: '2rem' }}>
            <h2>Personal Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <input
                  type="text"
                  value={user?.role === 'organizer' ? 'Event Organizer' : 'Regular User'}
                  disabled
                  style={{ background: 'var(--light)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="form-container">
            <h2>Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Payment History */}
          <div className="form-container" style={{ marginTop: '2rem' }}>
            <h2>Payment History</h2>
            
            {paymentHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                <p>No payment history yet</p>
                <p style={{ fontSize: '0.875rem' }}>Your purchased tickets will appear here</p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                {paymentHistory.map((ticket, index) => (
                  <div 
                    key={index}
                    style={{
                      background: 'var(--light)',
                      borderRadius: 'var(--radius)',
                      padding: '1rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{ticket.eventTitle}</span>
                      <span className="status-confirmed" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                        Confirmed
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray)' }}>
                      <div>Ticket #: <code style={{ background: 'white', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>{ticket.ticketNumber}</code></div>
                      <div>Quantity: {ticket.quantity}</div>
                      <div>Amount: KES {ticket.totalAmount?.toLocaleString()}</div>
                      <div>Date: {new Date(ticket.purchaseDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
