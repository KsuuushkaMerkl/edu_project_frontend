// src/router.js
import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from './store/auth'

import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Dashboard from './views/Dashboard.vue'
import Projects from './views/Projects.vue'
import Reports from './views/Reports.vue'
import Board from './views/Board.vue'
import DefectsList from './views/Defects.vue'
import DefectCreate from './views/DefectCreate.vue'
import DefectDetails from './views/DefectDetails.vue'
import Profile from './views/Profile.vue'   // ← вот это

const routes = [
    {path: '/', redirect: '/login'},

    {path: '/login', name: 'login', component: Login, meta: {public: true, noHeader: true}},
    {path: '/register', name: 'register', component: Register, meta: {public: true, noHeader: true}},

    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {roles: ['manager', 'engineer', 'observer', 'admin']}
    },

    // профиль — отдельная страница
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {roles: ['manager', 'engineer', 'observer', 'admin']}
    },

    {path: '/projects', name: 'projects', component: Projects, meta: {roles: ['manager', 'engineer']}},
    {
        path: '/projects/new',
        name: 'project-create',
        component: () => import('./views/ProjectCreate.vue'),
        meta: {roles: ['manager', 'engineer']}
    },
    {
        path: '/projects/:id',
        name: 'project-details',
        component: () => import('./views/ProjectDetails.vue'),
        meta: {roles: ['manager', 'engineer', 'observer']},
        props: true
    },

    {path: '/defects', name: 'defects', component: DefectsList, meta: {roles: ['manager', 'engineer', 'observer']}},
    {path: '/defects/new', name: 'defect-create', component: DefectCreate, meta: {roles: ['manager', 'engineer']}},
    {
        path: '/defects/:id',
        name: 'defect-details',
        component: DefectDetails,
        meta: {roles: ['manager', 'engineer', 'observer']},
        props: true
    },

    {
        path: '/reports',
        name: 'reports',
        component: Reports,
        meta: {roles: ['manager', 'observer', 'engineer', 'admin']}
    },
    {path: '/board', name: 'board', component: Board, meta: {roles: ['manager', 'engineer', 'observer', 'admin']}},

    {path: '/:pathMatch(.*)*', redirect: '/login'}
]

const router = createRouter({history: createWebHistory(), routes})

router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.public) return true
    if (!auth.user) return {path: '/login'}
    if (to.meta.roles && !to.meta.roles.includes(auth.user.role)) return {path: '/dashboard'}
    return true
})

export default router
