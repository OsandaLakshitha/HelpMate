// frontend/src/features/masss/lib/massApi.js

import { API_URL } from '../../../config/api'

/**
 * MASSS API utility — mirrors Helpmate's utils/api.js pattern exactly.
 *
 * Key facts confirmed from AuthContext.jsx:
 *   - Token key:  localStorage.getItem('token')
 *   - Base URL:   API_URL from config/api.js → http://localhost:8080
 *   - On 401:     clear token + redirect to /login
 *
 * All MASSS endpoints are scoped under /api/masss/*
 */

const TOKEN_KEY = 'token'

async function massRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }

  const response = await fetch(`${API_URL}/api/masss${endpoint}`, config)
  const data     = await response.json()

  if (!response.ok) {
    // 401 → token expired or invalid — mirrors Helpmate's logout behaviour
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    throw new Error(data.message || data.error || 'Something went wrong')
  }

  return data
}

// Clean API object — same shape as Helpmate's utils/api.js
export const massApi = {
  get:    (endpoint)       => massRequest(endpoint),
  post:   (endpoint, body) => massRequest(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body) => massRequest(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (endpoint, body) => massRequest(endpoint, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (endpoint)       => massRequest(endpoint, { method: 'DELETE' }),
}

export default massApi