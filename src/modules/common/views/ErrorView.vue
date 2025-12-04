<template>
  <div class="error-container">
    <div class="error-card">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <h1 class="error-title">{{ errorTitle }}</h1>
      <p class="error-code" v-if="errorCode">오류 코드: {{ errorCode }}</p>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-actions">
        <button @click="goBack" class="action-button secondary">
          이전 페이지
        </button>
        <button @click="goHome" class="action-button primary">
          홈으로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// URL 쿼리에서 에러 정보 추출
const errorCode = computed(() => route.query.code || '')
const errorType = computed(() => route.query.type || 'unknown')

// 에러 타입별 제목
const errorTitle = computed(() => {
  const titles = {
    '400': '잘못된 요청',
    '401': '인증 필요',
    '403': '접근 권한 없음',
    '404': '페이지를 찾을 수 없음',
    '500': '서버 오류',
    'network': '네트워크 오류',
    'unknown': '오류가 발생했습니다'
  }
  return titles[errorCode.value] || titles[errorType.value] || titles['unknown']
})

// 에러 타입별 메시지
const errorMessage = computed(() => {
  const messages = {
    '400': '요청이 올바르지 않습니다. 입력 내용을 확인해주세요.',
    '401': '로그인이 필요하거나 세션이 만료되었습니다.',
    '403': '해당 페이지에 접근할 권한이 없습니다.',
    '404': '요청하신 페이지를 찾을 수 없습니다. URL을 확인해주세요.',
    '500': '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'network': '네트워크 연결을 확인해주세요.',
    'unknown': '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  return route.query.message || messages[errorCode.value] || messages[errorType.value] || messages['unknown']
})

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/kpi')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 245, 245, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  padding: 2rem;
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(220, 38, 38, 0.05);
  padding: 3rem 2rem;
  text-align: center;
  max-width: 480px;
  width: 100%;
  animation: slideUp 0.5s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.error-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-card:hover {
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(220, 38, 38, 0.1);
  transform: translateY(-2px);
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-radius: 20px;
  animation: iconPulse 2s ease-in-out infinite;
}

.error-icon svg {
  color: #dc2626;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.error-code {
  font-size: 0.9rem;
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.action-button.primary {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.action-button:active {
  transform: translateY(0);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .error-container {
    padding: 1.5rem;
  }

  .error-card {
    padding: 2rem 1.5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-icon {
    width: 64px;
    height: 64px;
  }

  .error-icon svg {
    width: 48px;
    height: 48px;
  }

  .error-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .error-container {
    padding: 1rem;
  }

  .error-card {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }

  .error-title {
    font-size: 1.25rem;
  }

  .error-message {
    font-size: 0.9rem;
  }
}
</style>

