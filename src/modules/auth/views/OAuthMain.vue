<template>
  <div class="oauth-loading">
    <div class="spinner"></div>
    <p>인증 서버로 이동 중...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { buildAuthorizationUrlWithPKCE } from '@/config/oauthConfig'

onMounted(async () => {
  try {
    // PKCE 방식으로 OAuth 인증 URL 생성
    const authUrl = await buildAuthorizationUrlWithPKCE()
    console.log('🔐 PKCE OAuth 인증 시작')
    window.location.href = authUrl
  } catch (error) {
    console.error('OAuth 인증 URL 생성 실패:', error)
  }
})
</script>

<style scoped>
.oauth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.oauth-loading p {
  color: #666;
  font-size: 14px;
}
</style>

