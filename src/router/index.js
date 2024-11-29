import { createRouter, createWebHistory } from 'vue-router'
import App from "@/App.vue";
import NotFound from "@/components/NotFound.vue";
import MoviesList from "@/components/MoviesList.vue";
import SessionPlan from "@/components/SessionPlan.vue";



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: MoviesList,
    },
    {
      path: '/session/:id',
      name: 'session',
      component: SessionPlan,
      props: true,
    },
    {
      path: '/not-found',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/:catchAll(.*)',
      redirect: { name: 'NotFound' },
    },
  ],
})

export default router
