const axios = require('axios');
const User = require('../models/User');
const airtableConfig = require('../config/airtable');

const getAirtableClient = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.accessToken) {
    throw new Error('User not authenticated with Airtable');
  }
  return { accessToken: user.accessToken, userId: user._id };
};

const makeAirtableRequest = async (userId, method, url, data = null) => {
  const { accessToken } = await getAirtableClient(userId);
  const config = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    data
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const { accessToken: newAccessToken } = await exports.refreshAccessToken(userId);
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        const retryResponse = await axios(config);
        return retryResponse.data;
      } catch (refreshError) {
        throw new Error('Session expired. Please login again.');
      }
    }
    throw error;
  }
};

exports.fetchBases = (userId) => 
  makeAirtableRequest(userId, 'GET', 'https://api.airtable.com/v0/meta/bases');

exports.fetchBaseSchema = (userId, baseId) => 
  makeAirtableRequest(userId, 'GET', `https://api.airtable.com/v0/meta/bases/${baseId}/tables`);

exports.fetchRecords = (userId, baseId, tableIdOrName, options = {}) => {
  const params = new URLSearchParams();
  if (options.view) params.append('view', options.view);
  if (options.maxRecords) params.append('maxRecords', options.maxRecords);
  if (options.pageSize) params.append('pageSize', options.pageSize);
  if (options.filterByFormula) params.append('filterByFormula', options.filterByFormula);
  
  if (options.sort) {
    options.sort.forEach(s => {
      params.append('sort[0][field]', s.field);
      params.append('sort[0][direction]', s.direction || 'asc');
    });
  }

  const queryString = params.toString();
  const url = `https://api.airtable.com/v0/${baseId}/${tableIdOrName}${queryString ? '?' + queryString : ''}`;
  return makeAirtableRequest(userId, 'GET', url);
};

exports.createRecord = (userId, baseId, tableIdOrName, fields) => 
  makeAirtableRequest(userId, 'POST', `https://api.airtable.com/v0/${baseId}/${tableIdOrName}`, { fields });

exports.createRecords = (userId, baseId, tableIdOrName, records) => 
  makeAirtableRequest(userId, 'POST', `https://api.airtable.com/v0/${baseId}/${tableIdOrName}`, {
    records: records.map(fields => ({ fields }))
  });

exports.updateRecord = (userId, baseId, tableIdOrName, recordId, fields) => 
  makeAirtableRequest(userId, 'PATCH', `https://api.airtable.com/v0/${baseId}/${tableIdOrName}/${recordId}`, { fields });

exports.deleteRecord = (userId, baseId, tableIdOrName, recordId) => 
  makeAirtableRequest(userId, 'DELETE', `https://api.airtable.com/v0/${baseId}/${tableIdOrName}/${recordId}`);

exports.refreshAccessToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.refreshToken) throw new Error('No refresh token available');

  const { clientId, clientSecret, tokenUrl } = airtableConfig.oauth;
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: user.refreshToken
  });
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const { data } = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });

    user.accessToken = data.access_token;
    if (data.refresh_token) user.refreshToken = data.refresh_token;
    await user.save();

    return { accessToken: data.access_token };
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
};
