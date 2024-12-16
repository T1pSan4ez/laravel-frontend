import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: !!localStorage.getItem("authToken"),
    user: localStorage.getItem("authUser")?.replace(/^"(.*)"$/, "$1") || null,
  }),
  actions: {
    loginSuccess(token) {
      localStorage.setItem("authToken", token);
      this.isAuthenticated = true;
    },
    setUser(userName) {
      this.user = userName;
      localStorage.setItem("authUser", userName);
    },
    logout() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      this.isAuthenticated = false;
      this.user = null;
    },
  },
});
