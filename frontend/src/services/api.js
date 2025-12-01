import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) config.headers['x-user-id'] = user.id;
  return config;
});

export const authAPI = {
  initiateLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/airtable`;
  },
  handleCallback: async (userData) => userData,
};

export const formsAPI = {
  getForms: async () => (await api.get('/forms')).data,
  getForm: async (formId) => (await api.get(`/forms/${formId}`)).data,
  createForm: async (formData) => (await api.post('/forms', formData)).data,
  getBases: async () => (await api.get('/forms/bases')).data,
  getBaseSchema: async (baseId) => (await api.get(`/forms/bases/${baseId}/schema`)).data,
  getResponses: async (formId, page = 1, limit = 50) => 
    (await api.get(`/forms/${formId}/responses`, { params: { page, limit } })).data,
};

export const responsesAPI = {
  submitResponse: async (formId, answers) => 
    (await api.post(`/responses/${formId}/submit`, { answers })).data,
  getResponse: async (responseId) => (await api.get(`/responses/${responseId}`)).data,
};

export default api;
