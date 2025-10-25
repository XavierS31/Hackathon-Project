import React, { useState, useEffect } from "react";
import "./App.css";
import logoImg from "./assets/KNIGHTHAVENLOGOWHITE.png";
import { useAuth0 } from '@auth0/auth0-react';
import ServicesPage from './servicePages';
import Events from './Events';
import { isUCFUser, getDisplayName, isEmailVerified, isVerifiedUCFUser } from './auth0-config.js';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, error } = useAuth0();
  const [currentPage, setCurrentPage] = useState('home');
  const [authError, setAuthError] = useState(null);

  // Debug user data
  useEffect(() => {
    if (user) {
      console.log('=== USER DATA DEBUG ===');
      console.log('Full user object:', user);
      console.log('Email:', user.email);
      console.log('Email verified:', user.email_verified);
      console.log('Email verified type:', typeof user.email_verified);
      console.log('Nickname:', user.nickname);
      console.log('Username:', user.username);
      console.log('Username type:', typeof user.username);
      console.log('Preferred username:', user.preferred_username);
      console.log('Name:', user.name);
      console.log('Given name:', user.given_name);
      console.log('Family name:', user.family_name);
      console.log('Sub (subject):', user.sub);
      console.log('Custom username claim:', user['https://knighthaven/username']);
      console.log('User metadata:', user.user_metadata);
      console.log('App metadata:', user.app_metadata);
      console.log('All user keys:', Object.keys(user));
      console.log('User object JSON:', JSON.stringify(user, null, 2));
      console.log('Display name result:', getDisplayName(user));
      console.log('Is UCF user:', isUCFUser(user));
      console.log('Is email verified:', isEmailVerified(user));
      console.log('Is verified UCF user:', isVerifiedUCFUser(user));
      console.log('========================');
    }
  }, [user]);

  // Check for Auth0 errors in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // Debug logging
    console.log('=== AUTH0 ERROR DEBUG ===');
    console.log('Current URL:', window.location.href);
    console.log('URL Error:', error);
    console.log('URL Error Description:', errorDescription);
    console.log('All URL params:', Object.fromEntries(urlParams.entries()));
    console.log('========================');
    
    // Check if we're on Auth0's error page
    if (window.location.href.includes('auth0.com') && window.location.href.includes('error')) {
      console.log('Detected Auth0 error page');
      // This means Auth0 is showing the error, not redirecting back
    }
    
    if (error === 'access_denied' && errorDescription === 'ucf_only') {
      setAuthError('You must use a @ucf.edu email address to sign up. Please try again with your UCF email.');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'invalid_request' && errorDescription?.includes('user_exists')) {
      setAuthError('An account with this email already exists. Please try logging in instead.');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'invalid_request' && errorDescription?.includes('email')) {
      setAuthError('An account with this email already exists. Please try logging in instead.');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'invalid_request' && errorDescription?.includes('already exists')) {
      setAuthError('An account with this email already exists. Please try logging in instead.');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'invalid_request') {
      setAuthError('An account with this email already exists. Please try logging in instead.');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      // Show the exact error for debugging
      setAuthError(`DEBUG: Error=${error}, Description=${errorDescription || 'None'}`);
      console.log('Setting generic error message:', error, errorDescription);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle Auth0 errors from the hook
  useEffect(() => {
    if (error) {
      console.log('Auth0 Hook Error:', error);
      console.log('Error type:', typeof error);
      console.log('Error keys:', Object.keys(error));
      
      // Handle different error formats
      const errorCode = error.error || error.code || error.type;
      const errorMessage = error.error_description || error.message || error.description;
      
      console.log('Parsed error code:', errorCode);
      console.log('Parsed error message:', errorMessage);
      
      if (errorCode === 'access_denied' && errorMessage === 'ucf_only') {
        setAuthError('You must use a @ucf.edu email address to sign up. Please try again with your UCF email.');
      } else if (errorCode === 'invalid_request' || errorCode === 'user_exists' || errorCode === 'email_exists') {
        setAuthError('An account with this email already exists. Please try logging in instead.');
      } else if (errorMessage?.includes('user_exists') || errorMessage?.includes('already exists') || errorMessage?.includes('email')) {
        setAuthError('An account with this email already exists. Please try logging in instead.');
      } else {
        setAuthError(`Authentication error: ${errorCode || 'Unknown'} - ${errorMessage || 'Please try again'}`);
      }
    }
  }, [error]);

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
        alert(`Welcome back, ${getDisplayName(user)}!`);
      }
    } else if (pageName === 'Events') {
      setCurrentPage('events');
    } else if (pageName === 'Services') {
      // Handle Services page with Yelp data fetching
      fetchYelpData();
    } else {
      alert(`${pageName} page coming soon!`);
    }
  };

  const handleLogin = () => {
    setAuthError(null); // Clear any existing errors
    
    // Force login mode to avoid signup errors
    loginWithRedirect({
      authorizationParams: {
        prompt: 'login', // Force login screen
        screen_hint: 'login' // Show login instead of signup
      }
    });
  };

  const handleRetryLogin = () => {
    setAuthError(null); // Clear any existing errors
    
    // Clear browser storage to reset Auth0 state
    localStorage.removeItem('auth0.is.authenticated');
    sessionStorage.clear();
    
    // Force a completely fresh login attempt
    loginWithRedirect({
      authorizationParams: {
        prompt: 'login', // Force login screen
        screen_hint: 'signup' // Show signup option
      }
    });
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  //--YELP API ROUTE TO NODE.JS (ALWAYS FETCHES FRESH DATA)
  const fetchYelpData = async () => {
    try {
      console.log("🔄 Fetching FRESH Yelp data...");
      const res = await fetch("http://localhost:3001/api/refresh-data");
      const data = await res.json();
      console.log("✅ Fresh Yelp Data successfully fetched:", data);
      
                alert(`🔄 Refreshed! Stored ${data.stored} fresh places (max 50)\n🎲 Categories: ${data.categories ? data.categories.join(', ') : 'Random'}`);
      // Navigate to services page after fetching fresh data
      setCurrentPage('services');
    } catch (err) {
      console.error("❌ Error fetching fresh Yelp data:", err);
      alert("Failed to fetch fresh Yelp data. Check console for details.");
    }
  };

//END OF ROUTE TO NODE.JS API

//Display YELP
    //Fetch places already stored in DB
    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      try {
        const res = await fetch("http://localhost:3001/api/places");
        const data = await res.json();
        setPlaces(data);
        setShowPlaces(true);
      } catch (err) {
        console.error("Error loading places:", err);
        alert("Failed to load places");
      } finally {
        setLoadingPlaces(false);
      }
    };


//END OF DISPLAY YELP DATA







  // Show services page if currentPage is 'services'
  if (currentPage === 'services') {
    return <ServicesPage onBack={() => setCurrentPage('home')} />;
  }

  // Show events page if currentPage is 'events'
  if (currentPage === 'events') {
    return <Events onBack={() => setCurrentPage('home')} />;
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

          {/* AUTH / LOGIN / LOGOUT SECTION */}
          {isLoading ? (
            <div style={{ margin: '1rem 0', color: '#666' }}>Loading...</div>
          ) : isAuthenticated ? (
            <>
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
                <div
                  style={{
                    color: isEmailVerified(user) ? 'var(--text-main)' : '#888',
                    fontWeight: '600',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255, 204, 0, 0.4)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.9rem',
                    boxShadow:
                      "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,204,0,0.2)"
                  }}
                >
                  Welcome, {getDisplayName(user)}! 
                  {isVerifiedUCFUser(user) ? ' 🎓 (Verified Knight)' : 
                   isUCFUser(user) && !isEmailVerified(user) ? ' ⚠️ (Not Verified)' :
                   isEmailVerified(user) ? ' 🌎 (Community Member)' : ' ⚠️ (Not Verified)'}
                </div>

                {/* Email verification reminder */}
                {!isEmailVerified(user) && (
                  <div
                    style={{
                      color: '#ffa500',
                      backgroundColor: 'rgba(255, 165, 0, 0.1)',
                      border: '1px solid rgba(255, 165, 0, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      textAlign: 'center',
                      marginTop: '0.5rem'
                    }}
                  >
                    📧 Please verify your email to unlock full features
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    background:
                      "linear-gradient(135deg, #ff5858 0%, #aa2b2b 100%)",
                    color: 'white',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow:
                      "0 8px 20px rgba(255,0,0,0.4), 0 0 30px rgba(255,80,80,0.4)",
                    transition: 'all 0.25s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow =
                      "0 10px 24px rgba(255,0,0,0.6), 0 0 40px rgba(255,80,80,0.6)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow =
                      "0 8px 20px rgba(255,0,0,0.4), 0 0 30px rgba(255,80,80,0.4)";
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Error Message Display */}
              {authError && (
                <div style={{ 
                  margin: '1rem 0', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                  border: '1px solid rgba(255, 0, 0, 0.3)', 
                  borderRadius: '8px', 
                  color: '#ff6b6b',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  position: 'relative'
                }}>
                  ⚠️ {authError}
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      onClick={handleRetryLogin}
                      style={{
                        background: 'linear-gradient(135deg, #39FF14, #2ecb10)',
                        color: 'black',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        marginRight: '0.5rem'
                      }}
                    >
                      Try Again
                    </button>
                    {authError.includes('already exists') && (
                      <button
                        onClick={() => {
                          setAuthError(null);
                          // Force login mode instead of signup
                          loginWithRedirect({
                            authorizationParams: {
                              prompt: 'login',
                              screen_hint: 'login'
                            }
                          });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          marginRight: '0.5rem'
                        }}
                      >
                        Switch to Login
                      </button>
                    )}
                    <button
                      onClick={() => setAuthError(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255, 0, 0, 0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                  <button
                    onClick={() => setAuthError(null)}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#ff6b6b',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '0',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleLogin}
                  style={{
                    background: 'linear-gradient(135deg, #39FF14, #2ecb10)',
                    color: 'black',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow:
                      '0 4px 15px rgba(57, 255, 20, 0.5)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `
                      0 8px 20px rgba(57, 255, 20, 0.6),
                      0 0 30px rgba(255, 204, 0, 0.2),
                      0 0 60px rgba(255, 170, 0, 0.15)
                    `;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow =
                      '0 4px 15px rgba(57, 255, 20, 0.5)';
                  }}
                >
                  Login/Signup
                </button>
              </div>
            </>
          )}

          {/* NAV BAR */}
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
