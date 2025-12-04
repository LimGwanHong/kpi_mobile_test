// OAuth 라우트
export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/OAuthMain.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/oauth2/callback',
    name: 'oauth2-callback',
    component: () => import('./views/OAuthCallbackView.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('./views/LogoutView.vue'),
    meta: {
      requiresAuth: false
    }
  }
]

