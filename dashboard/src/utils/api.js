  import axios from 'axios'
  import { AuthService } from '@/services/auth'

  const api = axios.create({
    withCredentials: true
  })

  // Set up stored tokens and client on app init
  const storedClientName = localStorage.getItem('client_name')
  const accessToken = localStorage.getItem('access_token')

  if (storedClientName) {
    api.defaults.headers.common['UI-client-name'] = storedClientName
  }
  if (accessToken) {
    api.defaults.headers.common['authorization'] = `Bearer ${accessToken}`
  }

  // Token refresh logic
  let isRefreshingToken = false
  let requestQueue = []

  const processQueue = (error = null) => {
    requestQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
    requestQueue = []
  }

  // Response interceptor for token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (
        error.response?.status === 401 &&
        error.response.data === 'TokenExpired' &&
        originalRequest &&
        !originalRequest._retry
      ) {
        if (isRefreshingToken) {
          // Queue the request
          return new Promise((resolve, reject) => {
            requestQueue.push({ resolve, reject })
          }).then(() => {
            originalRequest.headers.authorization = `Bearer ${localStorage.getItem('access_token')}`
            return api(originalRequest)
          }).catch(err => Promise.reject(err))
        }

        // Check if token was already refreshed
        const currentToken = `Bearer ${localStorage.getItem('access_token')}`
        if (originalRequest.headers.authorization !== currentToken) {
          originalRequest.headers.authorization = currentToken
          api.defaults.headers.common['authorization'] = currentToken
          return Promise.resolve(api(originalRequest))
        }

        originalRequest._retry = true
        isRefreshingToken = true

        try {
          const tokenData = await AuthService.refreshToken()

          // Update stored tokens
          localStorage.setItem('access_token', tokenData.access_token)
          api.defaults.headers.common['authorization'] = `Bearer ${tokenData.access_token}`
          originalRequest.headers.authorization = `Bearer ${tokenData.access_token}`

          processQueue()

          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError)

          // Refresh token expired
          if (refreshError.response?.status === 401) {
            window.dispatchEvent(new Event('RefreshTokenExpired'))
          }

          return Promise.reject(refreshError)
        } finally {
          isRefreshingToken = false
        }
      }

      return Promise.reject(error)
    }
  )

  export default api