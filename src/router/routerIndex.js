import { createRouter, createWebHistory } from 'vue-router'

// 각 모듈의 라우트 import
import authRoutes from '@/modules/auth/routes'
import kpiRoutes from '@/modules/kpi/routes'
import commonRoutes from '@/modules/common/routes'

// 모든 모듈 라우트 병합
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/modules/auth/views/OAuthMain.vue'),
    meta: {
      requiresAuth: false
    }
  },
  ...authRoutes,
  ...kpiRoutes,
  ...commonRoutes  // 404 처리를 위해 마지막에 추가
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


export default router


