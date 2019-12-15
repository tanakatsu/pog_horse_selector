import Vue from 'vue'
import VueRouter from 'vue-router'
import firebase from 'firebase'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import HorseList from '../views/HorseList.vue'
import Download from '../views/Download.vue'
import Group from '../views/Group.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/login'
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/horselist/:owner_name',
    name: 'horselist',
    component: HorseList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/download',
    name: 'download',
    component: Download,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/group',
    name: 'group',
    component: Group,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !currentUser) next('login')
  else if (!requiresAuth && currentUser && from.path === "/") next('home')
  else if (currentUser && to.path === "/login") next('home')
  else next()
})

export default router
