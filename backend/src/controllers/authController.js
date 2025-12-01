const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const airtableConfig = require('../config/airtable');

exports.login = (req, res) => {
  res.send('Login endpoint');
};

/**
 * Simple API Key based authentication (alternative to OAuth)
 * This creates a user session using the Personal Access Token
 */
exports.airtableApiKeyAuth = async (req, res) => {
  try {
    const apiKey = airtableConfig.apiKey;
    
    if (!apiKey || !apiKey.startsWith('pat')) {
      return res.status(400).json({ 
        error: 'Invalid API key configuration',
        details: 'Please set AIRTABLE_API_KEY in your .env file'
      });
    }

    console.log('Authenticating with Airtable API Key...');

    // Fetch user's accessible bases to verify the API key works
    let bases = [];
    try {
      const basesResponse = await axios.get('https://api.airtable.com/v0/meta/bases', {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });
      bases = basesResponse.data.bases || [];
      console.log(`Successfully fetched ${bases.length} bases`);
    } catch (error) {
      console.error('API Key validation error:', error.response?.data || error.message);
      return res.status(401).json({
        error: 'Invalid API key',
        details: error.response?.data || 'Could not authenticate with Airtable'
      });
    }

    // Create a simple user ID based on the API key (for demo purposes)
    const userId = crypto.createHash('md5').update(apiKey).digest('hex');

    // Save or update user in database
    let user = await User.findOne({ airtableUserId: userId });
    
    if (user) {
      // Update existing user
      user.profile = {
        id: userId,
        email: 'api-key-user@local',
        bases: bases
      };
      user.accessToken = apiKey;
      user.loginAt = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        airtableUserId: userId,
        profile: {
          id: userId,
          email: 'api-key-user@local',
          bases: bases
        },
        accessToken: apiKey,
        loginAt: new Date()
      });
      await user.save();
    }

    console.log('User authenticated successfully with API key');

    // Return success response
    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        airtableUserId: user.airtableUserId,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('API Key auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }
};

// Store state temporarily (in production, use Redis or session store)
const stateStore = new Map();

// Redirect user to Airtable OAuth authorize URL
exports.airtableAuth = (req, res) => {
  const { clientId, redirectUri, authorizationUrl, scope } = airtableConfig.oauth;
  
  // Generate a random state parameter for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  // Generate PKCE code_verifier and code_challenge
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  // Store state and code_verifier with expiration (5 minutes)
  stateStore.set(state, { 
    timestamp: Date.now(),
    codeVerifier: codeVerifier
  });
  
  // Clean up expired states (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of stateStore.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      stateStore.delete(key);
    }
  }
  
  const authUrl = `${authorizationUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;
  
  console.log('Redirecting to Airtable OAuth with state:', state);
  console.log('PKCE code_challenge:', codeChallenge);
  res.redirect(authUrl);
};

// Handle OAuth callback and exchange code for access token
exports.airtableCallback = async (req, res) => {
  const { code, error, error_description, state } = req.query;
  
  if (error) {
    return res.status(400).json({ error: 'OAuth authorization failed', details: error_description || error });
  }
  
  if (!state || !stateStore.has(state)) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }
  
  const { codeVerifier } = stateStore.get(state);
  stateStore.delete(state);
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const { clientId, clientSecret, redirectUri, tokenUrl } = airtableConfig.oauth;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', codeVerifier);
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });

    const { access_token, refresh_token } = tokenResponse.data;
    
    const userProfileResponse = await axios.get('https://api.airtable.com/v0/meta/whoami', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userProfile = userProfileResponse.data;
    const airtableUserId = userProfile.id;

    let bases = [];
    try {
      const basesResponse = await axios.get('https://api.airtable.com/v0/meta/bases', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      bases = basesResponse.data.bases || [];
    } catch (err) {
      // Bases fetch failed, continue without them
    }

    let user = await User.findOne({ airtableUserId });
    
    const userData = {
      airtableUserId,
      profile: { ...userProfile, bases },
      accessToken: access_token,
      refreshToken: refresh_token,
      loginAt: new Date()
    };

    if (user) {
      Object.assign(user, userData);
      await user.save();
    } else {
      user = await User.create(userData);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth-callback?userId=${user._id}`);

  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Get current user details
 * GET /auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        airtableUserId: user.airtableUserId,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};
