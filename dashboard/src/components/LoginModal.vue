  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import ClientSelector from './ClientSelector.vue'

  export default {
    name: 'LoginModal',
    components: {
      ClientSelector
    },
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    emits: ['close', 'login-success'],
    setup(props, { emit }) {
      const authStore = useAuthStore()

      const form = ref({
        email: '',
        password: '',
        emailError: '',
        passwordError: ''
      })

      const showPassword = ref(false)
      const currentStep = ref(0)

      const showModal = computed(() => props.show)

      const clearErrors = () => {
        form.value.emailError = ''
        form.value.passwordError = ''
        authStore.error = null
      }

      const handleLogin = async () => {
        clearErrors()

        if (!form.value.email || !form.value.password) {
          if (!form.value.email) form.value.emailError = 'Email is required'
          if (!form.value.password) form.value.passwordError = 'Password is required'
          return
        }

        const result = await authStore.login(form.value.email, form.value.password)

        if (result.success) {
          // Move to client selection if multiple clients
          if (authStore.availableClients.length > 1) {
            currentStep.value = 1
          } else {
            // Single client - complete login
            emit('login-success')
            closeModal()
          }
        } else if (result.requiresPasswordChange) {
          // Handle password change requirement
          alert('Password change required') // Replace with proper modal
        } else if (result.requiresConfirmation) {
          // Handle signup confirmation requirement
          alert('Account confirmation required') // Replace with proper modal
        }
      }

      const handleClientSelected = async (client) => {
        await authStore.selectClient(client)
        emit('login-success')
        closeModal()
      }

      const closeModal = () => {
        form.value.email = ''
        form.value.password = ''
        currentStep.value = 0
        clearErrors()
        emit('close')
      }

      const handleExpiredSession = () => {
        authStore.handleExpiredSession()
        if (!showModal.value) {
          emit('show') // Trigger modal to show
        }
      }

      onMounted(() => {
        window.addEventListener('RefreshTokenExpired', handleExpiredSession)
      })

      onUnmounted(() => {
        window.removeEventListener('RefreshTokenExpired', handleExpiredSession)
      })

      return {
        authStore,
        form,
        showPassword,
        currentStep,
        showModal,
        handleLogin,
        handleClientSelected,
        closeModal,
        clearErrors
      }
    }
  }
  </script>

  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-container {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    min-width: 400px;
    max-width: 500px;
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-group input.error {
    border-color: #e74c3c;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .error-text {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .login-button {
    width: 100%;
    background: #3498db;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .login-button:hover:not(:disabled) {
    background: #2980b9;
  }

  .login-button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }

  .error-message {
    background: #fdf2f2;
    color: #e74c3c;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    border: 1px solid #fecaca;
  }
  </style>