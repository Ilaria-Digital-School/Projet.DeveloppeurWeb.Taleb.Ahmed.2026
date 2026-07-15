export const API_CONFIG = {
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me'
  },
  concerts: {
    list: '/concerts',
    featured: '/concerts/featured/list',
    cities: '/concerts/cities/list',
    details: (id: string) => `/concerts/${id}`
  },
  content: {
    portfolio: '/content/portfolio',
    portfolioItem: (id: string) => `/content/portfolio/${id}`,
    band: '/content/band',
    members: '/content/band/members',
    discography: '/content/band/discography'
  },
  contact: {
    send: '/contact/contact'
  },
  users: {
    profile: '/users/profile',
    update: '/users/profile'
  }
};