/**
 * API Service Client for communicating with the Node.js/Express + MongoDB backend.
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Check backend server and MongoDB status
 */
export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Backend server offline
  }
  return { status: 'offline', mongoConnected: false };
}

/**
 * Get list of all registered users / team members
 */
export async function getUsersApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API getUsers failed, using localStorage fallback:", e);
  }
  // Fallback
  const savedUsers = localStorage.getItem('geometrics_users');
  return savedUsers ? JSON.parse(savedUsers) : [{ _id: 'u-1', name: 'Default User', role: 'Field Agent' }];
}

/**
 * Get or register a User by Name
 */
export async function getOrCreateUserApi(name, role = 'Field Agent') {
  if (!name || name.trim() === '') return null;
  const trimmed = name.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, role })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API getOrCreateUser failed, fallback to local:", e);
  }

  // Fallback
  const users = await getUsersApi();
  let found = users.find(u => u.name.toLowerCase() === trimmed.toLowerCase());
  if (!found) {
    found = { _id: `u-${Date.now()}`, name: trimmed, role, lastActive: new Date() };
    const updated = [found, ...users];
    localStorage.setItem('geometrics_users', JSON.stringify(updated));
  }
  return found;
}

/**
 * Save a distance calculation history item to MongoDB
 */
export async function saveCalculationHistoryApi(historyPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyPayload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API saveCalculationHistory failed:", e);
  }
}

/**
 * Get distance calculation history for specific user
 */
export async function getUserHistoryApi(userName) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}/history`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API getUserHistory failed:", e);
  }
  return [];
}

/**
 * Get all Tours/Trips
 */
export async function getToursApi(assignedUser = null, status = null) {
  try {
    let url = `${API_BASE_URL}/tours`;
    const params = new URLSearchParams();
    if (assignedUser) params.append('assignedUser', assignedUser);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API getTours failed, fallback to local:", e);
  }

  // Fallback
  const savedTours = localStorage.getItem('geometrics_tours');
  let tours = savedTours ? JSON.parse(savedTours) : [];
  if (assignedUser) tours = tours.filter(t => t.assignedUser === assignedUser);
  if (status) tours = tours.filter(t => t.status === status);
  return tours;
}

/**
 * Create a new Tour
 */
export async function createTourApi(tourData) {
  try {
    const res = await fetch(`${API_BASE_URL}/tours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tourData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API createTour failed, fallback to local:", e);
  }

  // Fallback
  const savedTours = localStorage.getItem('geometrics_tours');
  const tours = savedTours ? JSON.parse(savedTours) : [];
  const newTour = { _id: `tour-${Date.now()}`, ...tourData, createdAt: new Date() };
  const updated = [newTour, ...tours];
  localStorage.setItem('geometrics_tours', JSON.stringify(updated));
  return newTour;
}

/**
 * Update Tour status
 */
export async function updateTourStatusApi(tourId, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API updateTourStatus failed:", e);
  }
}

/**
 * Delete Tour
 */
export async function deleteTourApi(tourId) {
  try {
    const res = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API deleteTour failed:", e);
  }
}
