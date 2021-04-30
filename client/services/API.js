import axios from 'axios';

const API = axios.create({
  baseURL: '/api/',
  // Add the global CSRF token to all AJAX requests. This should be added by the
  // rendered template that serves the react app.
  headers: {'X-CSRF-Token': window.config.CSRFToken},
});

export default API;
