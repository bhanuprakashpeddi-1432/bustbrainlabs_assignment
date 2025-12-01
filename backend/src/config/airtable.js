// Airtable configuration
module.exports = {
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID,
  oauth: {
    clientId: process.env.AIRTABLE_CLIENT_ID,
    clientSecret: process.env.AIRTABLE_CLIENT_SECRET,
    redirectUri: process.env.AIRTABLE_REDIRECT_URI,
    authorizationUrl: 'https://airtable.com/oauth2/v1/authorize',
    tokenUrl: 'https://airtable.com/oauth2/v1/token',
    scope: 'data.records:read data.records:write schema.bases:read user.email:read'
  }
};
