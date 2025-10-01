  import { defineStore } from 'pinia'
  import { signup, verify, refreshAccessToken, handleLogout } from '@/services/auth'
  import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    userEmail: ''
  }),

  getters: {
    isLoggedIn: (state) => {
      if (process.env.VUE_APP_IN_DEVELOPMENT === 'true') {
        console.log('[authStore] isLoggedIn getter called in development mode, returning true')
        state.isAuthenticated = true
        return true
      }
      const token = localStorage.getItem('accessToken')
      console.log('[authStore] isLoggedIn getter called, token:', token)
      if (!token) return false
      try {
        const decoded = jwtDecode(token)
        console.log('[authStore] isLoggedIn decoded token:', decoded)
        const valid = decoded.exp && Date.now() < decoded.exp * 1000
        if (valid && !state.isAuthenticated) state.isAuthenticated = true
        return valid
      } catch (e) {
        console.log('[authStore] isLoggedIn error decoding token:', e)
        if (state.isAuthenticated) state.isAuthenticated = false
        return false
      }
    },
  },

  actions: {
    async signup(email) {
      this.isLoading = true
      this.error = null
      try {
        await signup(email)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data || error.message || 'Signup failed'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async verify(email, code) {
      this.isLoading = true
      this.error = null
      try {
        const res = await verify(email, code)
        localStorage.setItem('accessToken', res.data.accessToken)
        localStorage.setItem('refreshToken', res.data.refreshToken)
        this.isAuthenticated = true
        this.userEmail = email
        return { success: true }
      } catch (error) {
        this.error = error.response?.data || error.message || 'Verification failed'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async refreshToken() {
      this.isLoading = true
      try {
        const refreshed = await refreshAccessToken()
        this.isAuthenticated = !!refreshed
        return refreshed
      } catch (error) {
        this.error = error.response?.data || error.message || 'Token refresh failed'
        return false
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      handleLogout()
      this.$reset()
    },

    async checkAuthStatus() {
      const token = localStorage.getItem('accessToken')
      console.log('[authStore] checkAuthStatus called, token:', token)
      if (token) {
        try {
          const decoded = jwtDecode(token)
          console.log('[authStore] checkAuthStatus decoded token:', decoded)
          if (decoded.exp && Date.now() < decoded.exp * 1000) {
            this.isAuthenticated = true
            this.userEmail = decoded.email || ''
            console.log('[authStore] checkAuthStatus: token valid, isAuthenticated set true')
            return true
          } else {
            console.log('[authStore] checkAuthStatus: token expired or missing exp')
          }
        } catch (e) {
          console.log('[authStore] checkAuthStatus error decoding token:', e)
        }
      }
      this.isAuthenticated = false
      this.userEmail = ''
      console.log('[authStore] checkAuthStatus: not authenticated, isAuthenticated set false')
      return false
    },

    handleExpiredSession() {
      this.logout()
      this.error = 'Session expired, please log in again'
    }
  }
})