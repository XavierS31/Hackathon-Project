import React, { useState, useEffect } from 'react';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Unable to connect to events service');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Date formatting removed since all events are from Today's Events


  if (loading) {
    return (
      <div className="events-container">
        <div className="events-header">
          <h1>UCF UCF Events</h1>
          <p>Discover what's happening at UCF</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading UCF Events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <div className="events-header">
          <h1>UCF UCF Events</h1>
          <p>Discover what's happening at UCF</p>
        </div>
        <div className="error-message">
          <h3>WARNING Unable to load events</h3>
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>UCF UCF Events</h1>
        <p>Discover what's happening at UCF today</p>
        
        <div className="events-controls">
          <button 
            onClick={() => {
              // Navigate back to home page by changing the current page state
              if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ type: 'navigate', page: 'home' }, '*');
              } else {
                // Fallback: try to navigate to the main app
                window.location.href = '/';
              }
            }} 
            className="home-button"
          >
            HOME Back to Home
          </button>
        </div>
      </div>

      <div className="events-stats">
        <div className="stat-card">
          <h3>{events.length}</h3>
          <p>Total Events</p>
        </div>
        <div className="stat-card">
          <h3>UCF</h3>
          <p>Events Source</p>
        </div>
        <div className="stat-card">
          <h3>Daily</h3>
          <p>Auto-Update</p>
        </div>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <div className="no-events">
            <h3>No events found</h3>
            <p>Check back later for new events</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div 
              key={event.id || index} 
              className="event-card clickable-event"
              onClick={() => {
                if (event.link) {
                  window.open(event.link, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="event-image">
                {event.image ? (
                  <img src={event.image} alt={event.title} />
                ) : (
                  <div className="default-event-image">
                    <span>UCF</span>
                  </div>
                )}
              </div>
              
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                
        <div className="event-meta">
          {event.time && event.time !== 'Time TBD' && (
            <div className="event-time">
              <span className="meta-icon">TIME</span>
              <span>{event.time}</span>
            </div>
          )}
          
          <div className="event-location">
            <span className="meta-icon">LOCATION</span>
            <span>{event.location}</span>
          </div>
        </div>
                
                <p className="event-description">{event.description}</p>
                
                <div className="event-footer">
                  <div className="event-source">
                    <span className="ucf-symbol">UCF</span>
                    <span className="source-badge">UCF Events</span>
                  </div>
                  
                  <div className="click-indicator">
                    <span>Click to view →</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
