import axios from 'axios'

const BASE_URL = 'http://192.168.29.76:8001'

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 10000,
})

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novhawk_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('novhawk_token')
      localStorage.removeItem('novhawk_user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export { BASE_URL }
export default client