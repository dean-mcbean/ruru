<template>
  <div class="login-view">
    <form v-if="step === 1" @submit.prevent="handleSignup">
      <img class="icon" src="@/assets/icon.svg" alt="App Logo" />
      <div class="login-prompt">Enter your email to sign up or log in:</div>
      <VTextField v-model="email" width="320" type="email" required />
      <button type="submit">Submit</button>
    </form>
    <form v-else @submit.prevent="handleVerify">
      <img class="icon" src="@/assets/icon.svg" alt="App Logo" />
      <div class="login-prompt">
        Enter the verification code sent to your Slack account:
      </div>
      <VOtpInput
        v-model="code"
        length="6"
        input-classes="code"
        :autofocus="true"
        :secure="false"
      />
      <button type="submit">Verify</button>
    </form>
    <div class="error-message" v-if="error">
      <i class="fa-solid fa-triangle-exclamation"></i>{{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VOtpInput, VTextField } from "vuetify/components";
import { signup, verify } from "@/services/auth";

const email = ref("");
const code = ref("");

const step = ref(1);
const error = ref("");

async function handleSignup() {
  console.log("[LoginPage] handleSignup called with", email.value);
  try {
    await signup(email.value);
    step.value = 2;
    error.value = "";
    console.log("[LoginPage] Signup success, moving to code entry");
  } catch (e) {
    error.value = e.response?.data || "Signup failed";
    console.log("[LoginPage] Signup error", error.value);
  }
}

async function handleVerify() {
  console.log("[LoginPage] handleVerify called with", email.value, code.value);
  try {
    const res = await verify(email.value, code.value);
    console.log("[LoginPage] Verification response", res.data);
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    error.value = "";
    console.log(
      "[LoginPage] Verification success, reloading page for fresh auth state",
    );
    window.location.href = "home";
  } catch (e) {
    error.value = e.response?.data || "Verification failed";
    console.log("[LoginPage] Verification error", error.value);
  }
}

if (process.env.VUE_APP_IN_DEVELOPMENT === "true") {
  window.location.href = "home";
}
</script>
<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-right: 60px;
}
.login-view form {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.login-prompt {
  margin-bottom: 8px;
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
.code {
  width: 122px;
  font-size: 2rem;
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
  letter-spacing: 1px;
  border: none;
  background: none;
  color: white;
  box-shadow: none;
  outline: none;
  align-self: center;
}
.code::placeholder {
  color: #fff;
  opacity: 0.2;
}
</style>
