import React, { useState, useEffect } from "react";
import "./App.css";
import logoImg from "./assets/KNIGHTHAVENLOGOWHITE.png";
import { useAuth0 } from '@auth0/auth0-react';
import Events from '../../events_tab/frontend/Events';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [currentPage, setCurrentPage] = useState('home');

  // Listen for navigation messages from child components
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'navigate') {
        setCurrentPage(event.data.page);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Navigation handler
  const handleNav = (pageName) => {
    if (pageName === 'Home') {
      setCurrentPage('home');
      if (isAuthenticated) {
        alert(`Welcome back, ${user?.name || user?.email}!`);
      }
    } else if (pageName === 'Events') {
      setCurrentPage('events');
    } else {
      alert(`${pageName} page coming soon!`);
    }
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  // Render Events page if current page is events
  if (currentPage === 'events') {
    return <Events />;
  }

  return (
    <div className="page-wrap">
      {/* HERO / TOP */}
      <header className="hero">
        {/* LEFT HOLO DECOR */}
        <div className="holo-left">
          <div className="holo-panel holo-float-slow">
            <div className="holo-frame"></div>

            <div className="holo-icon">
              {/* shield / crest style */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <div className="holo-lines">
              <div className="holo-line short"></div>
              <div className="holo-line long"></div>
              <div className="holo-line short"></div>
            </div>
          </div>

          <div className="holo-panel holo-float-fast">
            <div className="holo-frame small"></div>

            <div className="holo-icon">
              {/* triangular glyph */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12" y2="17"/>
              </svg>
            </div>

            <div className="holo-lines stacked">
              <div className="holo-line tiny"></div>
              <div className="holo-line tiny"></div>
            </div>
          </div>
        </div>

        {/* RIGHT HOLO DECOR */}
        <div className="holo-right">
          <div className="holo-panel holo-float-slow">
            <div className="holo-frame tall"></div>

            <div className="holo-icon">
              {/* tag / circuit shape */}
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.59 13.41l-7.18 7.18a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <circle cx="7.5" cy="7.5" r="1.5"/>
              </svg>
            </div>

            <div className="holo-lines">
              <div className="holo-line long"></div>
              <div className="holo-line short"></div>
            </div>
          </div>

          <div className="holo-panel holo-float-fast">
            <div className="holo-frame micro"></div>

            <div className="holo-lines stagger">
              <div className="holo-line tiny glow"></div>
              <div className="holo-line tiny"></div>
              <div className="holo-line tiny glow"></div>
            </div>
          </div>
        </div>

        {/* CENTER HERO CONTENT */}
        <div className="hero-inner">
          {/* Logo with pulsing glow */}
          <div className="logo-wrapper">
            <div className="glow-pulse"></div>
            <img
              src={logoImg}
              alt="KnightHaven logo"
              className="logo-img"
            />
          </div>

          {/* App name */}
          <div className="app-name">KnightHaven</div>

          {/* Tagline */}
          <p className="tagline">
            A trusted social + marketplace platform built for the UCF
            community.
          </p>

          {/* Authentication Section */}
          {isLoading ? (
            <div style={{ margin: '1rem 0', color: '#666' }}>Loading...</div>
          ) : isAuthenticated ? (
            <div
              style={{
                margin: '1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                Welcome, {user?.name || user?.email}!
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleLogin}
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #f06292)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(233, 30, 99, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
                }}
              >
                Login/Signup
              </button>
            </div>
          )}

          {/* TOP NAV BUTTONS */}
          <nav className="top-nav">
            <button
              className="nav-link"
              onClick={() => handleNav("Home")}
            >
               Home
            </button>

            <button
              className="nav-link"
              onClick={() => handleNav("Events")}
            >
               Events
            </button>

            <button
              className="nav-link"
              onClick={() => handleNav("Marketplace")}
            >
               Marketplace
            </button>

            <button
              className="nav-link"
              onClick={() => handleNav("News")}
            >
               News
            </button>

            <button
              className="nav-link"
              onClick={() => handleNav("Services")}
            >
               Services
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* Overview */}
        <section className="card overview-card">
          <div className="section-label">⚡ KnightHaven</div>

          <div className="section-title">
            Built for UCF students and Orlando locals
          </div>

          <div className="section-body">
            KnightHaven is a local social and marketplace web app built
            for the UCF community — connecting students and locals through
            posts, listings, and verified accounts.
            <br />
            <br />
            Created during a UCF hackathon, KnightHaven empowers users to
            buy, sell, share, and discover in one trusted, student-driven
            platform.
          </div>
        </section>

        {/* What it is / mission */}
        <section className="card">
          <div className="section-label">🚀 Overview</div>

          <div className="section-title">
            Social connection + local commerce in one place
          </div>

          <div className="section-body">
            KnightHaven helps UCF students and Orlando locals interact
            through community posts, services, and campus-based opportunities —
            all powered by real verification and location awareness.
          </div>

          <ul className="bullet-list">
            <li className="bullet-item">
              <span className="bullet-icon">•</span>
              <span>
                Stay plugged in with campus life and Orlando activity.
              </span>
            </li>
            <li className="bullet-item">
              <span className="bullet-icon">•</span>
              <span>
                Discover local deals, services, events, and opportunities.
              </span>
            </li>
            <li className="bullet-item">
              <span className="bullet-icon">•</span>
              <span>
                Connect with verified students for trust + safety.
              </span>
            </li>
          </ul>
        </section>

        {/* Account system */}
        <section className="card">
          <div className="section-label">👥 Account System</div>

          <div className="section-title">🎓 UCF Users</div>

          <div className="section-body">
            Verified with a <strong>@ucf.edu</strong> email to unlock
            trusted, student-only features.
          </div>

          <ul className="bullet-list">
            <li className="bullet-item">
              <span className="bullet-icon">•</span>
              <span>
                “Verified Knight” badge for trust and credibility.
              </span>
            </li>
            <li className="bullet-item">
              <span className="bullet-icon">•</span>
              <span>
                Access to student-only spaces and listings.
              </span>
            </li>
            <li className="bullet-item">
              <span className="bullet-icon">•</span>
              <span>
                Priority access to campus-relevant opportunities.
              </span>
            </li>
          </ul>

          <div
            className="section-title"
            style={{ marginTop: "1.5rem" }}
          >
            🌎 Non-UCF Users
          </div>

          <div className="section-body">
            Non-students can still browse public listings, view
            services, and interact with the broader local community —
            safely and transparently.
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p className="footer-text">
          <span className="footer-strong">KnightHaven</span> — built
          during a UCF hackathon for the Knight community.
        </p>
      </footer>
    </div>
  );
}

export default App;
