<template>
  <div class="login-view">
    <form v-if="step === 1" @submit.prevent="handleSignup">
      <img class="icon" src="@/assets/icon.svg" alt="App Logo" />
      <div class="login-prompt">Enter your email to sign up or log in:</div>
      <input v-model="email" placeholder="Email" type="email" required />
      <button type="submit">Submit</button>
    </form>
    <form v-else @submit.prevent="handleVerify">
      <img class="icon" src="@/assets/icon.svg" alt="App Logo" />
      <div class="login-prompt">Enter the verification code sent to your Slack account:</div>
      <input v-model="code" placeholder="Verification Code" required />
      <button type="submit">Verify</button>
    </form>
    <div class="error-message" v-if="error"><i class="fa-solid fa-triangle-exclamation"></i>{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { signup, verify } from '@/services/auth';

const email = ref('');
const code = ref('');
const step = ref(1);
const error = ref('');

async function handleSignup() {
  console.log('[LoginPage] handleSignup called with', email.value)
  try {
    await signup(email.value);
    step.value = 2;
    error.value = '';
    console.log('[LoginPage] Signup success, moving to code entry')
  } catch (e) {
    error.value = e.response?.data || 'Signup failed';
    console.log('[LoginPage] Signup error', error.value)
  }
}

async function handleVerify() {
  console.log('[LoginPage] handleVerify called with', email.value, code.value)
  try {
    const res = await verify(email.value, code.value);
    console.log('[LoginPage] Verification response', res.data)
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    error.value = '';
    console.log('[LoginPage] Verification success, reloading page for fresh auth state')
    window.location.href = '/dashboard/home';
  } catch (e) {
    error.value = e.response?.data || 'Verification failed';
    console.log('[LoginPage] Verification error', error.value)
  }
}

if (process.env.VUE_APP_IN_DEVELOPMENT === 'true') {
  window.location.href = '/dashboard/home';
}
</script>
<style scoped>
.login-view { 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
 }
 .login-view form {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
 }
 input {
  align-self: stretch;
  margin-top: 8px;
 }
.login-prompt {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #ecf0f1;
}
.icon {
  height: 200px;
  position: absolute;
  top: -248px;
}
.fa-triangle-exclamation {
  color: #ffcc00;
  margin-right: 8px;
}
.error-message {
  margin-top: 1rem;
  color: #ffcc00;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>