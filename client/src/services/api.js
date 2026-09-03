import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Problems
export const problemsAPI = {
  getAll: (params) => api.get('/problems', { params }),
  getBySlug: (slug) => api.get(`/problems/${slug}`),
  getTags: () => api.get('/problems/tags/all'),
};

// Submissions
export const submissionsAPI = {
  run: (data) => api.post('/submissions/run', data),
  submit: (data) => api.post('/submissions/submit', data),
  getUserSubmissions: (userId) => api.get(`/submissions/user/${userId}`),
};

// Social
export const socialAPI = {
  sendFriendRequest: (recipientId) => api.post('/social/friend-request', { recipient_id: recipientId }),
  respondFriendRequest: (id, status) => api.put(`/social/friend-request/${id}`, { status }),
  getFriends: () => api.get('/social/friends'),
  getFriendRequests: () => api.get('/social/friend-requests'),
  toggleFollow: (userId) => api.post(`/social/follow/${userId}`),
  getFollowers: (userId) => api.get(`/social/followers/${userId}`),
  getFollowing: (userId) => api.get(`/social/following/${userId}`),
  createPost: (data) => api.post('/social/posts', data),
  getFeed: (params) => api.get('/social/feed', { params }),
  likePost: (postId) => api.post(`/social/posts/${postId}/like`),
  commentPost: (postId, content) => api.post(`/social/posts/${postId}/comment`, { content }),
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
};

// Users
export const usersAPI = {
  search: (q) => api.get('/users/search', { params: { q } }),
  getById: (id) => api.get(`/users/by-id/${id}`),
  getProfile: (username) => api.get(`/users/${username}`),
  getLeaderboard: () => api.get('/users/leaderboard'),
};

// Recommendations
export const recommendationsAPI = {
  getUsers: (limit) => api.get('/recommendations/users', { params: { limit } }),
  getProblems: (limit) => api.get('/recommendations/problems', { params: { limit } }),
};

export default api;
