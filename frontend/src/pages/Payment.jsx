import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Footer from '../components/Footer';

const Payment = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'processing', 'success'

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/api/events/${eventId}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load event');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalAmount = event ? event.price * quantity : 0;
  const availableTickets = event?.availableTickets || 0;

  const simulateMpesaPayment = async () => {
    // Simulate M-Pesa STK push
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock payment details
        const mockTicket = {
          _id: Date.now().toString(),
          ticketNumber: `TKT-${Date.now().toString(36).toUpperCase()}`,
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          quantity: quantity,
          totalAmount: totalAmount,
          phoneNumber: phoneNumber,
          receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}`,
          purchaseDate: new Date().toISOString(),
          paymentMethod: 'M-Pesa',
          status: 'confirmed'
        };
        resolve(mockTicket);
      }, 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setPaymentStep('processing');

    try {
      // Simulate M-Pesa payment
      const mockTicket = await simulateMpesaPayment();
      
      // In a real app, you would call the backend API
      // const token = localStorage.getItem('token');
      // const response = await axios.post(
      //   '/api/payments/process',
      //   { eventId, quantity, phoneNumber },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // setTicket(response.data.ticket);
      
      setTicket(mockTicket);
      setPaymentStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPaymentStep('details');
    }

    setProcessing(false);
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

  if (error && !event) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <Link to="/events" className="btn btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  if (success && ticket) {
    return (
      <div>
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your ticket has been booked successfully.</p>

            <div className="ticket-details">
              <p>
                <strong>Ticket Number:</strong>
                <code style={{ 
                  background: 'var(--light)', 
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem'
                }}>
                  {ticket.ticketNumber}
                </code>
              </p>
              <p>
                <strong>Event:</strong> {ticket.eventTitle}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(ticket.eventDate)}
              </p>
              <p>
                <strong>Time:</strong> {ticket.eventTime}
              </p>
              <p>
                <strong>Location:</strong> {ticket.eventLocation}
              </p>
              <p>
                <strong>Quantity:</strong> {ticket.quantity}
              </p>
              <p>
                <strong>Total Paid:</strong> KES {ticket.totalAmount.toLocaleString()}
              </p>
              <p>
                <strong>Phone:</strong> {ticket.phoneNumber}
              </p>
              <p>
                <strong>Receipt #:</strong> {ticket.receiptNumber}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.open(`https://event-management-sys-63du.onrender.com/api/payments/ticket/${ticket.ticketNumber}`, '_blank');
                }}
              >
                Download Ticket
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                View My Tickets
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <div>
        <div className="container">
          <div className="success-message">
            <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem' }}></div>
            <h2>Processing Payment...</h2>
            <p>Please wait while we process your M-Pesa payment.</p>
            <div className="ticket-details" style={{ marginTop: '1.5rem' }}>
              <p><strong>Event:</strong> {event.title}</p>
              <p><strong>Amount:</strong> KES {totalAmount.toLocaleString()}</p>
              <p><strong>Phone:</strong> {phoneNumber}</p>
            </div>
            <p style={{ color: 'var(--gray)', marginTop: '1rem', fontSize: '0.9rem' }}>
              You should receive an M-Pesa prompt on your phone. Enter your PIN to complete the payment.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="container">
        <div className="payment-container">
          <h2>Complete Your Booking</h2>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Event Summary */}
          <div className="payment-summary">
            <h3>Event Details</h3>
            <p><strong>{event.title}</strong></p>
            <p>{formatDate(event.date)} at {event.time}</p>
            <p>{event.location}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="quantity">Number of Tickets</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              >
                {[...Array(Math.min(availableTickets || event?.capacity || 10, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} ticket{i !== 0 ? 's' : ''}
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--gray)' }}>
                {availableTickets || event?.capacity || 10} tickets available
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">M-Pesa Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 254712345678"
                pattern="[0-9]{12}"
                title="Enter phone number in format 254XXXXXXXXX"
                required
              />
              <small style={{ color: 'var(--gray)' }}>
                You will receive an M-Pesa prompt on this number
              </small>
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
              <h3>Payment Summary</h3>
              <div className="payment-summary-row">
                <span>Ticket Price</span>
                <span>{event.price === 0 ? 'Free' : `KES ${event.price}`}</span>
              </div>
              <div className="payment-summary-row">
                <span>Quantity</span>
                <span>x {quantity}</span>
              </div>
              <div className="payment-summary-row">
                <span>Total</span>
                <span>
                  {event.price === 0 
                    ? 'Free' 
                    : `KES ${totalAmount.toLocaleString()}`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={processing}
            >
              {processing ? 'Processing Payment...' : `Pay ${event.price === 0 ? 'Free' : `KES ${totalAmount.toLocaleString()}`}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--gray)', fontSize: '0.875rem' }}>
            Secure payment powered by M-Pesa
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
