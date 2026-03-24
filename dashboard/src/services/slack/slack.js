import authAxios from "../axios";
import { useAuthStore } from "../../stores/auth";
export const notifyOnSlack = (message) => {
  const authStore = useAuthStore();

  return authAxios.post(`${process.env.VUE_APP_BASE_API_URL}/slack/notify`, {
    message,
    email: authStore.userEmail,
  });
};
