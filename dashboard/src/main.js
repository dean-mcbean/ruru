import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

const app = createApp(App);
const pinia = createPinia();
const vuetify = createVuetify();

app.use(vuetify);
app.use(pinia);
app.use(router);

app.mount("#app");

// Now you can use stores after mounting, e.g.:
import { useAuthStore } from "./stores/auth";
const authStore = useAuthStore();
authStore.checkAuthStatus();
