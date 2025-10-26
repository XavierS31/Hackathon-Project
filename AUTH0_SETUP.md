# 🔐 Auth0 Setup Guide for KnightHaven

## ✅ What's Already Done

- ✅ Auth0 React SDK installed
- ✅ Authentication buttons added to the UI
- ✅ Auth0Provider configured in main.jsx
- ✅ Authentication state integrated with the app

## 🚀 Next Steps: Configure Auth0

### 1. Create Auth0 Account
1. Go to [https://auth0.com](https://auth0.com)
2. Sign up for a free account
3. Choose "Single Page Application" when prompted

### 2. Create Your Application
1. In the Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **"Create Application"**
3. Name: `KnightHaven`
4. Choose **"Single Page Application"**
5. Click **"Create"**

### 3. Configure Application Settings
In your Auth0 application settings, update these URLs:

**Allowed Callback URLs:**
```
http://localhost:5174
```

**Allowed Logout URLs:**
```
http://localhost:5174
```

**Allowed Web Origins:**
```
http://localhost:5174
```

### 4. Get Your Credentials
1. Copy your **Domain** (looks like: `your-tenant.auth0.com`)
2. Copy your **Client ID** (looks like: `abc123def456...`)

### 5. Update Configuration
Edit `/frontend/src/auth0-config.js` and replace:

```javascript
export const auth0Config = {
  domain: 'your-domain.auth0.com', // ← Replace with your actual domain
  clientId: 'your-client-id', // ← Replace with your actual client ID
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://knighthaven-api',
    scope: 'openid profile email'
  }
};
```

### 6. Test the Integration
1. Start your app: `npm run dev` (frontend) and `npm run dev` (backend)
2. Go to `http://localhost:5174`
3. Click **"Sign In"** or **"Sign Up"**
4. You should be redirected to Auth0's login page
5. After authentication, you'll be redirected back to your app

## 🎯 Features Added

### Authentication Buttons
- **Sign In** button (blue) - for existing users
- **Sign Up** button (green) - for new users
- **Sign Out** button (red) - appears when logged in

### User Experience
- Shows loading state while authenticating
- Displays welcome message with user's name/email
- Personalized navigation (Home button shows welcome message when logged in)

### Security Features
- Secure token-based authentication
- Automatic token refresh
- Secure logout with proper cleanup

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri" error**
   - Make sure `http://localhost:5174` is in your Auth0 Allowed Callback URLs

2. **"Invalid client" error**
   - Double-check your Client ID in auth0-config.js

3. **CORS errors**
   - Make sure `http://localhost:5174` is in your Allowed Web Origins

4. **App not loading after login**
   - Check that your Domain and Client ID are correct
   - Make sure the app is running on port 5174

## 🚀 Production Deployment

When deploying to production:
1. Update the URLs in Auth0 to your production domain
2. Update the `redirect_uri` in auth0-config.js
3. Consider using environment variables for sensitive data

## 📱 What Users Will See

- **Not logged in**: Sign In and Sign Up buttons
- **Logged in**: Welcome message with user's name and Sign Out button
- **Loading**: "Loading..." message while authentication is processing

Your KnightHaven app now has professional authentication! 🎉
