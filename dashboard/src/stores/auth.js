import { defineStore } from 'pinia'
import { signup, verify, refreshAccessToken, handleLogout } from '@/services/auth'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('accessToken')
    const initState = {
      userFirstName: null,
      userLastName: null,
      userProfileImage: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userEmail: ''
    }
    
    if (token) {
      const decoded = jwtDecode(token)
      initState.userEmail = decoded.email || ''
      initState.userFirstName = decoded.first_name || ''
      initState.userLastName = decoded.last_name || ''
      initState.userProfileImage = decoded.profile_image || ''
    }
    return initState
  },

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
        console.log('[authStore] refreshToken error:', this.error)
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
      if (process.env.VUE_APP_IN_DEVELOPMENT === 'true') {
        console.log('[authStore] checkAuthStatus called in development mode, setting dummy auth state')
        this.isAuthenticated = true
        this.userFirstName = process.env.VUE_APP_DEV_FIRST_NAME || 'Dev'
        this.userLastName = process.env.VUE_APP_DEV_LAST_NAME || 'User'
        this.userEmail = process.env.VUE_APP_DEV_EMAIL || 'dev@example.com'
        this.userProfileImage = process.env.VUE_APP_DEV_PROFILE_IMAGE || null
        return true
      }
      let token = localStorage.getItem('accessToken')
      console.log('[authStore] checkAuthStatus called, token:', token)
      if (token) {
        try {
          let decoded = jwtDecode(token)
          console.log('[authStore] checkAuthStatus decoded token:', decoded)
          // If token is expired or about to expire in 1 minute, try to refresh
          if (!decoded.exp || Date.now() >= decoded.exp * 1000 - 60000) {
          console.log('[authStore] checkAuthStatus: token expired or about to expire, attempting refresh')
          const refreshed = await this.refreshToken()
          console.log('[authStore] checkAuthStatus: refreshToken result:', refreshed)
          if (refreshed && refreshed.accessToken) {
            token = refreshed.accessToken 
            localStorage.setItem('accessToken', token)
            decoded = jwtDecode(token)
            console.log('[authStore] checkAuthStatus: token refreshed and decoded:', decoded)

            // if "redirect" set in url, redirect now
            const urlParams = new URLSearchParams(window.location.search)
            const redirectPath = urlParams.get('redirect')
            if (redirectPath) {
              console.log('[authStore] checkAuthStatus: redirecting to', redirectPath)
              window.location.href = "/dashboard" + (redirectPath.startsWith("/") ? redirectPath : "/" + redirectPath)
            }
          } else {
            console.log('[authStore] checkAuthStatus: token refresh failed')
            this.isAuthenticated = false
            this.userEmail = ''
            this.userFirstName = null
            this.userLastName = null
            this.userProfileImage = null
            return false
          }
          }
          if (decoded.exp && Date.now() < decoded.exp * 1000) {
            this.isAuthenticated = true
            this.userEmail = decoded.email || ''
            this.userFirstName = decoded.first_name || ''
            this.userLastName = decoded.last_name || ''
            this.userProfileImage = decoded.profile_image || ''
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
      this.userFirstName = null
      this.userLastName = null
      this.userProfileImage = null
      console.log('[authStore] checkAuthStatus: not authenticated, isAuthenticated set false')
      return false
    },

    handleExpiredSession() {
      this.logout()
      this.error = 'Session expired, please log in again'
    }
  }
})
