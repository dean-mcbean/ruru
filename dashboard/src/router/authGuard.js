import { useAuthStore } from '@/stores/auth'


export const requireAuth = async (to, from, next) => {
  if (process.env.VUE_APP_IN_DEVELOPMENT === 'true') {
    console.log('[authGuard] Development mode: skipping auth check & setting dummy auth state')
    next()
    return
  }
  const authStore = useAuthStore()
  console.log('[authGuard] requireAuth called', { to: to.fullPath })

  // Check if accessToken exists in localStorage (new system)
  const hasTokens = !!localStorage.getItem('accessToken')
  console.log('[authGuard] hasTokens:', hasTokens)

  if (!hasTokens) {
    console.log('[authGuard] No tokens, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (!authStore.isLoggedIn) {
    console.log('[authGuard] Store not logged in, checking auth status')
    try {
      const isAuthenticated = await authStore.checkAuthStatus()
      console.log('[authGuard] checkAuthStatus result:', isAuthenticated)
      if (isAuthenticated) {
        console.log('[authGuard] Authenticated, proceeding')
        next()
      } else {
        console.log('[authGuard] Not authenticated after check, redirecting to login')
        next({ name: 'login', query: { redirect: to.fullPath } })
      }
    } catch (error) {
      console.log('[authGuard] Auth check failed, logging out and redirecting', error)
      authStore.logout()
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  } else {
    console.log('[authGuard] Already logged in, proceeding')
    next()
  }
}

  export const requireGuest = (to, from, next) => {
    const authStore = useAuthStore()

    if (authStore.isLoggedIn) {
      next({ name: 'dashboard' }) // or wherever authenticated users should go
    } else {
      next()
    }
  }