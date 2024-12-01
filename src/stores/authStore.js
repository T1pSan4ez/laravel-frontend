import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: !!localStorage.getItem("authToken"),
  }),
  actions: {
    loginSuccess(token) {
      localStorage.setItem("authToken", token);
      this.isAuthenticated = true;
    },
    logout() {
      localStorage.removeItem("authToken");
      this.isAuthenticated = false;
    },
  },
});
