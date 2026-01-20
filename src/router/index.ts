import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import AuthService from '@/services/AuthService';
import PerfilPage from '@/views/PerfilPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/register',
    component: RegisterPage
  },
  {
  path: '/perfil',
  component: PerfilPage,
  beforeEnter: (to, from, next) => {
      if (AuthService.isLoggedIn()) next();
      else next('/login');
  }
},
  {
    path: '/home',
    component: HomePage,
    beforeEnter: (to, from, next) => {
      if (AuthService.isLoggedIn()) {
        next();
      } else {
        next('/login');
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router