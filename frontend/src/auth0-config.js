// Auth0 configuration for KnightHaven
// You'll need to replace these with your actual Auth0 credentials

export const auth0Config = {
  domain: 'dev-mposv8s2kz3buzi0.us.auth0.com',
  clientId: 'iDcHM2wW70AZriEyY9oxgKUdOAoUShKI',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://knighthaven-api',
    scope: 'openid profile email'
  }
};

// Instructions for setup:
// 1. Go to https://auth0.com and create a free account
// 2. Create a new Single Page Application
// 3. Copy your Domain and Client ID from the Auth0 dashboard
// 4. Replace the values above with your actual credentials
// 5. Add http://localhost:3000 to your Allowed Callback URLs
// 6. Add http://localhost:3000 to your Allowed Logout URLs
// 7. Add http://localhost:3000 to your Allowed Web Origins
