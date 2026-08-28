import {
  mockSubmitListing,
  mockSubmitFeedback,
  mockFetchCategories,
  CATEGORIES
} from './mockApi.js';

// Set FORCE_MOCK = true by default for standalone frontend dev to avoid ECONNREFUSED proxy logs when backend is offline
const FORCE_MOCK = false;
const API_BASE_URL = '/api';

/**
 * Retrieve or generate the anonymous client session ID.
 * Persists in localStorage.
 * @returns {string} The client session ID.
 */
export function getClientSessionId() {
  try {
    let sessionId = localStorage.getItem('client_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('client_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    console.warn('LocalStorage or Cryptography API is unavailable. Using temporary session ID.', e);
    // Temporary session ID for session lifespan
    if (!window.__temp_session_id) {
      window.__temp_session_id = 'session-' + Math.random().toString(36).substring(2, 15);
    }
    return window.__temp_session_id;
  }
}

// Initialize on app/module load
try {
  getClientSessionId();
} catch (e) {
  // Fallback gracefully
}

/**
 * Submit listing for risk analysis
 * @param {Object} listingData - { title, description, price, category, seller_info }
 * @returns {Promise<Object>} - Object #4: { submission_id, score, verdict, flags, tip }
 */
export async function submitListing(listingData) {
  if (FORCE_MOCK) {
    return await mockSubmitListing(listingData);
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: listingData.title || '',
        description: listingData.description || '',
        price: Number(listingData.price) || 0,
        category: listingData.category || CATEGORIES[0],
        seller_info: listingData.seller_info || null,
        client_session_id: getClientSessionId(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend server offline. Using mock API fallback.');
    return await mockSubmitListing(listingData);
  }
}

/**
 * Submit feedback vote for a submission
 * @param {Object} feedbackData - { submission_id, was_accurate }
 * @returns {Promise<Object>} - { success: true }
 */
export async function submitFeedback(feedbackData) {
  if (FORCE_MOCK) {
    return await mockSubmitFeedback(feedbackData);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission_id: feedbackData.submission_id,
        was_accurate: Boolean(feedbackData.was_accurate),
        submitted_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend server offline. Using mock feedback fallback.');
    return await mockSubmitFeedback(feedbackData);
  }
}

/**
 * Fetch available listing categories
 * @returns {Promise<Array<string>>}
 */
export async function fetchCategories() {
  if (FORCE_MOCK) {
    return await mockFetchCategories();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/meta/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.categories || CATEGORIES;
  } catch (error) {
    console.warn('Backend server offline. Using default categories list fallback.');
    return await mockFetchCategories();
  }
}
export async function signup(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }
  return data;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}