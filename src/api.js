const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Add refresh token functionality
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function request(path, opts = {}) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Prepare headers
    const headers = { ...opts.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Set content type if not FormData
    if (!opts.body || !(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Make the request
    const res = await fetch(API + path, {
      ...opts,
      headers,
      body: opts.body && headers['Content-Type'] === 'application/json' 
        ? JSON.stringify(opts.body) 
        : opts.body
    });

    // Parse response
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // Handle error responses
    if (!res.ok) {
      // Special handling for 401 Unauthorized
      if (res.status === 401) {
        if (path === '/api/auth/me') {
          // If checking auth status fails, clear token and throw error
          localStorage.removeItem('token');
          throw new Error('Authentication required');
        }
        
        // Handle token refresh
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Try to get a new token
            const newToken = await refreshToken();
            localStorage.setItem('token', newToken);
            
            // Retry the original request with new token
            const newRes = await request(path, opts);
            processQueue(null, newToken);
            return newRes;
          } catch (error) {
            processQueue(error, null);
            localStorage.removeItem('token');
            throw new Error('Session expired. Please login again.');
          } finally {
            isRefreshing = false;
          }
        } else {
          // Wait for the token refresh
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => request(path, opts));
        }
      }
      
      throw new Error(data.message || data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

// Helper function to refresh token
async function refreshToken() {
  const res = await fetch(API + '/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    throw new Error('Token refresh failed');
  }
  
  const data = await res.json();
  return data.token;
}

export default {
  register: (data) => request('/api/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: data }),
  me: () => request('/api/auth/me'),
  generate: (data) => request('/api/generate', { method: 'POST', body: data }),
  getPosts: () => request('/api/posts'),
  deletePost: (id) => request('/api/posts/' + id, { method: 'DELETE' }),
  getPost: (id) => request('/api/posts/' + id),
  updatePost: (id, data) => request('/api/posts/' + id, { method: 'PUT', body: data })
};
