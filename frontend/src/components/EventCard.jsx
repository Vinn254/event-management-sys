import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event }) => {
  const { isAuthenticated } = useAuth();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get gradient background for event image based on category
  const getCategoryGradient = (category) => {
    const gradients = {
      concert: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      conference: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      workshop: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      sports: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      theater: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      festival: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      other: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    };
    return gradients[category] || gradients.other;
  };

  return (
    <div className="event-card">
      <div className="event-image" style={{ background: getCategoryGradient(event.category) }}>
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: '700' }}>
            {event.category ? event.category.charAt(0).toUpperCase() : 'E'}
          </span>
        )}
      </div>
      <div className="event-content">
        <span className="event-category">{event.category}</span>
        <h3 className="event-title">{event.title}</h3>
        <div className="event-details">
          <p>{formatDate(event.date)} at {event.time}</p>
          <p>{event.location}</p>
          <p>
            {event.availableTickets !== undefined 
              ? `${event.availableTickets} tickets left`
              : `${event.capacity} capacity`}
          </p>
        </div>
        <div className="event-footer">
          <div className="event-price">
            {event.price === 0 ? 'Free' : `KES ${event.price}`}
            <span>/ticket</span>
          </div>
          {isAuthenticated ? (
            <Link to={`/payment/${event._id}`} className="btn btn-primary btn-sm">
              Book Now
            </Link>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm">
              Login to Book
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
