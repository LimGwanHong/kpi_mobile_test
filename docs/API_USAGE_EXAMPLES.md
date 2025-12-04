# auth.api.js 사용 예시

## 개요

`auth.api.js`는 인증 관련 API 호출을 담당하는 모듈입니다. 다양한 방식으로 사용할 수 있습니다.

## 기본 사용법

### 1. Store에서 사용 (권장)

```javascript
// src/stores/auth.store.js
import { authAPI } from '@/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  const login = async (credentials) => {
    try {
      // authAPI.login() 호출
      const response = await authAPI.login({
        email: credentials.email,
        password: credentials.password
      })
      
      // 응답 처리
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      
      // 토큰 저장
      localStorage.setItem('token', newToken)
      
      return { success: true, data: userData }
    } catch (error) {
      // 에러 처리
      const message = error.response?.data?.message || '로그인에 실패했습니다.'
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      // authAPI.logout() 호출
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 로컬 상태 초기화
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  return {
    token,
    user,
    login,
    logout
  }
})
```

### 2. Composable에서 사용

```javascript
// src/composables/useAuth.js
import { authAPI } from '@/api/auth.api'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  const loading = ref(false)
  const error = ref(null)

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login({ email, password })
      
      // 성공 처리
      const token = response.data.token
      localStorage.setItem('token', token)
      
      // 홈으로 이동
      router.push('/')
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '로그인에 실패했습니다.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  return {
    loading,
    error,
    login,
    logout
  }
}
```

### 3. 컴포넌트에서 직접 사용

```vue
<!-- src/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="이메일" />
    <input v-model="password" type="password" placeholder="비밀번호" />
    <button type="submit" :disabled="loading">
      {{ loading ? '로그인 중...' : '로그인' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '@/api/auth.api'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // authAPI.login() 직접 호출
    const response = await authAPI.login({
      email: email.value,
      password: password.value
    })
    
    // 응답 처리
    const { token, user } = response.data
    
    // 토큰 저장
    localStorage.setItem('token', token)
    
    // 홈으로 이동
    router.push('/')
  } catch (err) {
    // 에러 처리
    error.value = err.response?.data?.message || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
```

## 각 API 함수 사용 예시

### 1. login (로그인)

```javascript
import { authAPI } from '@/api/auth.api'

// 기본 사용
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
})

// 응답 구조
// {
//   data: {
//     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//     user: {
//       id: 1,
//       email: 'user@example.com',
//       name: '홍길동'
//     }
//   }
// }
```

### 2. logout (로그아웃)

```javascript
import { authAPI } from '@/api/auth.api'

// 로그아웃 (토큰이 자동으로 헤더에 추가됨)
try {
  await authAPI.logout()
  localStorage.removeItem('token')
  // 로그인 페이지로 이동
} catch (error) {
  console.error('Logout failed:', error)
}
```

### 3. refreshToken (토큰 갱신)

```javascript
import { authAPI } from '@/api/auth.api'

// 토큰 갱신
const refreshToken = localStorage.getItem('refreshToken')

try {
  const response = await authAPI.refreshToken(refreshToken)
  const { token: newToken } = response.data
  
  // 새 토큰 저장
  localStorage.setItem('token', newToken)
} catch (error) {
  // 토큰 갱신 실패 시 로그인 페이지로
  console.error('Token refresh failed:', error)
  router.push('/login')
}
```

### 4. forgotPassword (비밀번호 찾기)

```vue
<!-- 비밀번호 찾기 컴포넌트 -->
<template>
  <form @submit.prevent="handleForgotPassword">
    <input v-model="email" type="email" placeholder="이메일 입력" />
    <button type="submit" :disabled="loading">
      {{ loading ? '전송 중...' : '비밀번호 재설정 링크 전송' }}
    </button>
    <div v-if="success" class="success">
      이메일을 확인해주세요.
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '@/api/auth.api'

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleForgotPassword = async () => {
  loading.value = true
  error.value = ''
  success.value = false
  
  try {
    await authAPI.forgotPassword(email.value)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.message || '이메일 전송에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
```

### 5. resetPassword (비밀번호 재설정)

```vue
<!-- 비밀번호 재설정 컴포넌트 -->
<template>
  <form @submit.prevent="handleResetPassword">
    <input v-model="newPassword" type="password" placeholder="새 비밀번호" />
    <input v-model="confirmPassword" type="password" placeholder="비밀번호 확인" />
    <button type="submit" :disabled="loading || !isValid">
      비밀번호 재설정
    </button>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth.api'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

// URL에서 토큰 가져오기 (예: /reset-password?token=xxx)
const resetToken = computed(() => route.query.token)

const isValid = computed(() => {
  return newPassword.value.length >= 8 && 
         newPassword.value === confirmPassword.value
})

const handleResetPassword = async () => {
  if (!isValid.value) {
    error.value = '비밀번호가 일치하지 않거나 너무 짧습니다.'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await authAPI.resetPassword(resetToken.value, newPassword.value)
    
    // 성공 시 로그인 페이지로 이동
    router.push('/login?message=password-reset-success')
  } catch (err) {
    error.value = err.response?.data?.message || '비밀번호 재설정에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
```

## 실제 사용 시나리오

### 시나리오 1: 로그인 페이지

```vue
<!-- src/modules/auth/views/LoginView.vue -->
<template>
  <div class="login-view">
    <LoginForm @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoginForm from '../components/LoginForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLoginSuccess = () => {
  // 로그인 성공 후 처리
  router.push('/')
}
</script>
```

```vue
<!-- src/modules/auth/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>이메일</label>
      <input
        v-model="formData.email"
        type="email"
        required
        placeholder="이메일을 입력하세요"
      />
    </div>
    
    <div class="form-group">
      <label>비밀번호</label>
      <input
        v-model="formData.password"
        type="password"
        required
        placeholder="비밀번호를 입력하세요"
      />
    </div>
    
    <button type="submit" :disabled="loading" class="btn-primary">
      <span v-if="loading">로그인 중...</span>
      <span v-else>로그인</span>
    </button>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="links">
      <router-link to="/forgot-password">비밀번호 찾기</router-link>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const emit = defineEmits(['login-success'])

const authStore = useAuthStore()
const router = useRouter()

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  // Store를 통해 API 호출 (권장)
  const result = await authStore.login(formData.value)
  
  if (result.success) {
    emit('login-success')
    router.push('/')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>
```

### 시나리오 2: 자동 토큰 갱신

```javascript
// src/api/axiosInstance.js에 추가
import { authAPI } from './auth.api'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // 401 에러이고 토큰 갱신이 아직 진행 중이 아닐 때
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      
      try {
        const response = await authAPI.refreshToken(refreshToken)
        const { token: newToken } = response.data
        
        localStorage.setItem('token', newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        
        processQueue(null, newToken)
        isRefreshing = false
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.push('/login')
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
```

### 시나리오 3: 에러 처리 개선

```javascript
// src/utils/apiErrorHandler.js
import { authAPI } from '@/api/auth.api'

export const handleApiError = (error) => {
  if (error.response) {
    // 서버 응답이 있는 경우
    const status = error.response.status
    const message = error.response.data?.message || '알 수 없는 오류가 발생했습니다.'
    
    switch (status) {
      case 401:
        // 인증 실패 - 이미 axiosInstance에서 처리
        return { type: 'unauthorized', message: '인증이 필요합니다.' }
      case 403:
        return { type: 'forbidden', message: '접근 권한이 없습니다.' }
      case 404:
        return { type: 'notFound', message: '요청한 리소스를 찾을 수 없습니다.' }
      case 500:
        return { type: 'serverError', message: '서버 오류가 발생했습니다.' }
      default:
        return { type: 'error', message }
    }
  } else if (error.request) {
    // 요청은 보냈지만 응답이 없는 경우
    return { type: 'networkError', message: '네트워크 연결을 확인해주세요.' }
  } else {
    // 요청 설정 중 오류
    return { type: 'requestError', message: '요청 중 오류가 발생했습니다.' }
  }
}

// 사용 예시
try {
  await authAPI.login(credentials)
} catch (error) {
  const errorInfo = handleApiError(error)
  console.error(errorInfo.type, errorInfo.message)
  // Toast 알림 등으로 사용자에게 표시
}
```

## 주의사항

### 1. 에러 처리

```javascript
// ❌ 나쁜 예
const login = async () => {
  await authAPI.login(credentials)  // 에러 처리 없음
}

// ✅ 좋은 예
const login = async () => {
  try {
    const response = await authAPI.login(credentials)
    // 성공 처리
  } catch (error) {
    // 에러 처리
    console.error('Login failed:', error)
  }
}
```

### 2. 로딩 상태 관리

```javascript
// ✅ 로딩 상태 관리
const loading = ref(false)

const login = async () => {
  loading.value = true
  try {
    await authAPI.login(credentials)
  } finally {
    loading.value = false
  }
}
```

### 3. 토큰 저장

```javascript
// ✅ Store나 localStorage에 저장
const response = await authAPI.login(credentials)
localStorage.setItem('token', response.data.token)

// ❌ 컴포넌트의 로컬 변수에만 저장 (페이지 새로고침 시 사라짐)
const token = response.data.token
```

이 예시들은 `auth.api.js`를 다양한 방식으로 사용하는 방법을 보여줍니다. 프로젝트 구조에 맞게 선택해 사용하세요.

