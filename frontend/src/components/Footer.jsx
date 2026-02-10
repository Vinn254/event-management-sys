import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h3>EventHub</h3>
          <p>Your one-stop platform for discovering and booking amazing events.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/register">Get Started</Link>
        </div>
        <div>
          <h3>Categories</h3>
          <Link to="/events?category=concert">Concerts</Link>
          <Link to="/events?category=conference">Conferences</Link>
          <Link to="/events?category=workshop">Workshops</Link>
          <Link to="/events?category=sports">Sports</Link>
        </div>
        <div>
          <h3>Support</h3>
          <p>Help Center</p>
          <p>Contact Us</p>
          <p>FAQ</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
