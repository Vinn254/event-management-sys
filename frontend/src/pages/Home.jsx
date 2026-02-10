import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>Discover Amazing Events</h1>
        <p>
          Find and book tickets for concerts, conferences, workshops, and more.
          Join thousands of event enthusiasts on EventHub.
        </p>
        <div className="hero-buttons">
          <Link to="/events" className="btn btn-secondary">
            Explore Events
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>
          Why Choose EventHub?
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">B</div>
            <h3>Easy Booking</h3>
            <p>
              Book tickets in seconds with our seamless booking system.
              No hassle, just click and go.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">C</div>
            <h3>Community</h3>
            <p>
              Connect with fellow event enthusiasts and discover
              trending events in your area.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">M</div>
            <h3>Mobile Friendly</h3>
            <p>
              Access EventHub from any device. Browse, book, and manage
              events on the go.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">S</div>
            <h3>Secure Payments</h3>
            <p>
              Safe and secure payment processing with M-Pesa.
              Your transactions are protected.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">A</div>
            <h3>Analytics</h3>
            <p>
              For organizers: Track sales, attendance, and revenue
              with powerful analytics tools.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">N</div>
            <h3>Notifications</h3>
            <p>
              Get instant updates about your bookings and
              never miss an event.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>
              "EventHub made it so easy to find and book tickets for the annual tech conference.
              The mobile app is fantastic!"
            </p>
            <h4>— Sarah M., Nairobi</h4>
          </div>
          <div className="testimonial-card">
            <p>
              "As an event organizer, the analytics dashboard has been invaluable.
              I can track my sales in real-time."
            </p>
            <h4>— James K., Mombasa</h4>
          </div>
          <div className="testimonial-card">
            <p>
              "The seamless payment process with M-Pesa is a game changer.
              No more queuing at ticket windows!"
            </p>
            <h4>— Emily W., Kisumu</h4>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Experience Amazing Events?</h2>
        <p>
          Join EventHub today and discover a world of unforgettable experiences.
        </p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-secondary">
            Create Your Account
          </Link>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
