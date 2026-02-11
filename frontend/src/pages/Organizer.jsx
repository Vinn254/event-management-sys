import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Organizer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    category: 'other',
    capacity: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/api/events/my-events');
      console.log('Fetched events:', response.data);
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      // Check if auth error - clear token and redirect
      if (err.response?.status === 401) {
        logout();
        navigate('/login?reason=session_expired');
        return;
      }
      setError('Failed to load your events: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setUploading(true);

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const response = await api.post('/api/upload', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setFormData({
          ...formData,
          image: response.data.url
        });
      } catch (err) {
        console.error('Upload error:', err);
        // Fallback to file name if upload fails
        setFormData({
          ...formData,
          image: file.name
        });
      }

      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingEvent) {
        await api.put(`/api/events/${editingEvent._id}`, formData);
      } else {
        await api.post('/api/events', formData);
      }
      
      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        category: 'other',
        capacity: '',
        image: ''
      });
      setImagePreview('');
      fetchMyEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    }

    setSubmitting(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      price: event.price || '',
      category: event.category || 'other',
      capacity: event.capacity || '',
      image: event.image || ''
    });
    setImagePreview(event.image || '');
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setError('');
    try {
      await api.delete(`/api/events/${eventId}`);
      fetchMyEvents();
    } catch (err) {
      console.error('Delete event error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to delete event. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
    <div>
      <section className="dashboard">
        <div className="dashboard-header">
          <h1>Organizer Dashboard</h1>
          <p>Manage your events and track performance</p>
        </div>

        <div className="dashboard-cards">
          <button className="dashboard-card" onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              description: '',
              date: '',
              time: '',
              location: '',
              price: '',
              category: 'other',
              capacity: '',
              image: ''
            });
            setImagePreview('');
            setShowModal(true);
          }}>
            <div className="icon">+</div>
            <h3>Create New Event</h3>
            <p>Add a new event to your catalog</p>
          </button>

          <Link to="/analytics" className="dashboard-card">
            <div className="icon">A</div>
            <h3>View Analytics</h3>
            <p>Track sales and performance</p>
          </Link>

          <div className="dashboard-card">
            <div className="icon">E</div>
            <h3>Total Events</h3>
            <p>{events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="dashboard-card">
            <div className="icon">P</div>
            <h3>Total Attendees</h3>
            <p>
              {events.reduce((sum, event) => 
                sum + event.attendees.reduce((s, a) => s + a.quantity, 0), 0
              )}
            </p>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: '2rem' }}>
          <div className="table-header">
            <h2>My Events</h2>
            <button className="btn btn-primary" onClick={() => {
              setEditingEvent(null);
              setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                price: '',
                category: 'other',
                capacity: '',
                image: ''
              });
              setImagePreview('');
              setShowModal(true);
            }}>
              Create Event
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <h3>No Events Yet</h3>
              <p>You haven't created any events yet.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Create Your First Event
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Tickets Sold</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const ticketsSold = event.attendees.reduce((sum, a) => sum + a.quantity, 0);
                  const revenue = event.attendees.reduce((sum, a) => sum + a.totalAmount, 0);
                  
                  return (
                    <tr key={event._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div 
                            style={{ 
                              width: '48px', 
                              height: '48px', 
                              borderRadius: '8px',
                              background: getCategoryGradient(event.category),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1.25rem'
                            }}
                          >
                            {event.image ? (
                              <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                              event.category ? event.category.charAt(0).toUpperCase() : 'E'
                            )}
                          </div>
                          <div>
                            <strong>{event.title}</strong>
                            <br />
                            <small style={{ color: 'var(--gray)' }}>{event.category}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.location}</td>
                      <td>{event.price === 0 ? 'Free' : `KES ${event.price}`}</td>
                      <td>
                        {ticketsSold} / {event.capacity}
                        <br />
                        <small style={{ color: 'var(--gray)' }}>
                          {Math.round((ticketsSold / event.capacity) * 100)}% sold
                        </small>
                      </td>
                      <td>KES {revenue.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEdit(event)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(event._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button className="modal-close" onClick={() => {
                setShowModal(false);
                setEditingEvent(null);
              }}>
                ✕
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter venue location"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price per Ticket (KES)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0 for free"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="capacity">Capacity</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Max attendees"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="concert">Concert</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="sports">Sports</option>
                  <option value="theater">Theater</option>
                  <option value="festival">Festival</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Image</label>
                <div className="file-upload" onClick={() => document.getElementById('image').click()}>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <div className="spinner"></div>
                      <p style={{ marginTop: '1rem' }}>Uploading to Cloud...</p>
                    </div>
                  ) : imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <>
                      <div className="file-upload-icon">+</div>
                      <p>Click to upload event image</p>
                      <small>PNG, JPG up to 5MB</small>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Organizer;
