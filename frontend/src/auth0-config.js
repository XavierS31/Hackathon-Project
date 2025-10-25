// Auth0 configuration for KnightHaven
// You'll need to replace these with your actual Auth0 credentials

export const auth0Config = {
  domain: 'dev-j128izgqa8zt8f42.us.auth0.com',
  clientId: 'JKgtM8QIzwcpMR0P8ow3HkmKgpDIzsQz',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://knighthaven-api',
    scope: 'openid profile email'
  }
};

// Helper function to check if user is UCF student
export const isUCFUser = (user) => {
  return user?.email?.endsWith('@ucf.edu') || false;
};

// Helper function to get display name (username, name, or email)
export const getDisplayName = (user) => {
  return user?.nickname || user?.name || user?.email || 'User';
};

// Helper function to check if user's email is verified
export const isEmailVerified = (user) => {
  return user?.email_verified === true;
};

// Helper function to check if user is verified UCF student
export const isVerifiedUCFUser = (user) => {
  return isUCFUser(user) && isEmailVerified(user);
};


// Instructions for setup:
// 1. Go to https://auth0.com and create a free account
// 2. Create a new Single Page Application
// 3. Copy your Domain and Client ID from the Auth0 dashboard
// 4. Replace the values above with your actual credentials
// 5. Add http://localhost:3000 to your Allowed Callback URLs
// 6. Add http://localhost:3000 to your Allowed Logout URLs
// 7. Add http://localhost:3000 to your Allowed Web Origins
