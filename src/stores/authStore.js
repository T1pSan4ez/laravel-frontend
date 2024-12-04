import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: !!localStorage.getItem("authToken"),
    user: null,
  }),
  actions: {
    loginSuccess(token) {
      localStorage.setItem("authToken", token);
      this.isAuthenticated = true;
    },
    setUser(userData) {
      this.user = userData;
    },
    logout() {
      localStorage.removeItem("authToken");
      this.isAuthenticated = false;
      this.user = null;
    },
  },
});
