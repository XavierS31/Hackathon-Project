import React from "react";
import "./App.css";
import logoImg from "./assets/KNIGHTHAVENLOGOWHITE.png";
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  // temp nav behavior: just show a popup for now
  const handleNav = (pageName) => {
    if (pageName === 'Home' && isAuthenticated) {
      alert(`Welcome back, ${user?.name || user?.email}!`);
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

  return (
    <div className="page-wrap">
      {/* HERO / TOP */}
      <header className="hero">
        <div className="hero-inner">
          {/* Logo */}
          <img
            src={logoImg}
            alt="KnightHaven logo"
            className="logo-img"
          />

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
            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                  background: 'linear-gradient(135deg, #3498db, #2ecc71)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
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
              onClick={() => handleNav("Social Events")}
            >
               Social
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

