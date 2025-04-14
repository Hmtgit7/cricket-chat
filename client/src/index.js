import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Configure axios defaults for the entire app
import axios from 'axios';

// Set default baseURL
axios.defaults.baseURL = 'http://localhost:5000/api';

// Check for stored token and set it in headers
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)