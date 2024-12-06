import { createRouter, createWebHistory } from "vue-router";
import MoviesList from "@/components/MoviesList.vue";
import SessionPlan from "@/components/SessionPlan.vue";
import AuthContainer from "@/components/auth/AuthContainer.vue";
import NotFound from "@/components/NotFound.vue";

import { useAuthStore } from "@/stores/authStore";
import QRCode from "@/components/QRCode.vue";
import MovieDiscover from "@/components/MovieDiscover.vue";
import MovieDetails from "@/components/MovieDetails.vue";
import UserProfile from "@/components/UserProfile.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: MoviesList,
    },
    {
      path: "/session/:id",
      name: "session",
      component: SessionPlan,
      props: true,
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthContainer,
    },
    {
      path: "/qrcode",
      name: "QRCodePage",
      component: QRCode,
    },
    {
      path: "/movies",
      name: "MovieDiscover",
      component: MovieDiscover,
    },
    {
      path: "/movie/:id",
      name: "MovieDetails",
      component: MovieDetails,
    },
    {
      path: "/profile",
      name: "profile",
      component: UserProfile,
    },
    {
      path: "/not-found",
      name: "NotFound",
      component: NotFound,
    },
    {
      path: "/:catchAll(.*)",
      redirect: { name: "NotFound" },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.name === "auth" && isAuthenticated) {
    next({ name: "Home" });
  } else if (to.name === "profile" && !isAuthenticated) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
