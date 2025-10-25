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
        <div className="hero-layout">
          {/* LEFT HOLO DECOR (no icons) */}
          <div className="holo-left">
            <div className="holo-panel holo-float-slow">
              <div className="holo-frame"></div>

              <div className="holo-lines">
                <div className="holo-line short"></div>
                <div className="holo-line long"></div>
                <div className="holo-line short"></div>
              </div>
            </div>

            <div className="holo-panel holo-float-fast">
              <div className="holo-frame small"></div>

              <div className="holo-lines stacked">
                <div className="holo-line tiny"></div>
                <div className="holo-line tiny"></div>
              </div>
            </div>
          </div>

          {/* MAIN HERO CONTENT */}
          <div className="hero-inner">
            {/* Glowing logo */}
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
              A trusted social + marketplace
              <br />
              platform built for the UCF community.
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
                      color: 'var(--text-main)',
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
                    Welcome, {user?.name || user?.email}!
                  </div>

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

          {/* RIGHT HOLO DECOR (no icons) */}
          <div className="holo-right">
            <div className="holo-panel holo-float-slow">
              <div className="holo-frame tall"></div>

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
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* Overview */}
        <section className="card overview-card">
          <div className="section-label">
            ⚡ KNIGHTHAVEN
          </div>

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

        {/* Mission / Value */}
        <section className="card">
          <div className="section-label">🚀 OVERVIEW</div>

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

        {/* Account System */}
        <section className="card">
          <div className="section-label">👥 ACCOUNT SYSTEM</div>

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

        {/* Live Activity / Demo Feed */}
        <section className="card">
          <div className="section-label">📡 LIVE ACTIVITY</div>

          <div className="section-title">
            Community updates (demo data)
          </div>

          <ul className="bullet-list">
            <li className="bullet-item">
              <span className="bullet-icon">✅</span>
              <span>
                Emma <strong>(Verified Knight)</strong> posted a tutoring offer for Calculus I.
              </span>
            </li>

            <li className="bullet-item">
              <span className="bullet-icon">📚</span>
              <span>
                Alex listed: <strong>Physics 1 &amp; Chem 1 textbooks bundle</strong> · $30.
              </span>
            </li>

            <li className="bullet-item">
              <span className="bullet-icon">🚗</span>
              <span>
                Jordan is looking for a <strong>ride to campus Saturday 9am</strong> from Avalon Park.
              </span>
            </li>

            <li className="bullet-item">
              <span className="bullet-icon">🛠</span>
              <span>
                “PC repairs / custom builds — UCF student discount this week.”
              </span>
            </li>
          </ul>
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
