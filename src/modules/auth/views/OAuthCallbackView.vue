<template>
  <div class="oauth-callback">
    <div class="spinner"></div>
    <p>인증 처리 중...</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import axiosInstance from '@/api/axiosInstance'
import { oauthConfig, getCodeVerifier, clearPKCEStorage } from '@/config/oauthConfig'
import { useTokenStore } from '@/stores/storesIndex'
import { authAPI } from '@/api/authApi'

const route = useRoute()
const router = useRouter()
const tokenStore = useTokenStore()
const { setAccessToken, setRefreshToken } = tokenStore

// 사용자 정보 저장 함수
const setUser = (userInfo) => {
  localStorage.setItem('user_info', JSON.stringify(userInfo))
}

// URL에서 query string 제거 (히스토리에 남기지 않음)
const clearUrlParams = () => {
  window.history.replaceState({}, document.title, window.location.pathname)
}

;(async () => {
  try {
    // URL에서 authorization code 추출
    const code = route.query.code
    const error = route.query.error

    if (error) {
      console.error('OAuth 인증 오류:', error)
      clearUrlParams()
      clearPKCEStorage()
      router.push('/logout')
      return
    }

    if (!code) {
      console.error('Authorization code가 없습니다.')
      clearUrlParams()
      clearPKCEStorage()
      router.push('/logout')
      return
    }

    // sessionStorage에서 code_verifier 가져오기
    const codeVerifier = getCodeVerifier()
    
    if (!codeVerifier) {
      console.error('code_verifier가 없습니다. PKCE 인증 플로우가 손상되었습니다.')
      clearUrlParams()
      router.push('/logout')
      return
    }

    console.log('🔐 PKCE 토큰 교환 시작')
    console.log('- code:', code.substring(0, 20) + '...')
    console.log('- code_verifier:', codeVerifier.substring(0, 20) + '...')

    // 토큰 요청 전에 URL에서 code 제거 (재사용 방지)
    clearUrlParams()

    // PKCE 방식: code_verifier를 포함하여 토큰 요청
    // client_secret 대신 code_verifier 사용
    const response = await axiosInstance.post(
      oauthConfig.tokenEndpoint,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: oauthConfig.redirectUri,
        client_id: oauthConfig.clientId,
        code_verifier: codeVerifier
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    // PKCE 관련 sessionStorage 정리
    clearPKCEStorage()

    if (response.data?.access_token) {
      // 토큰 저장
      setAccessToken(response.data.access_token)
      
      console.log('✅ 토큰 저장 완료 (PKCE)')
      console.log('- access_token:', response.data.access_token?.substring(0, 20) + '...')
      console.log('- 저장 확인:', tokenStore.getAccessToken()?.substring(0, 20) + '...')
      
      // 사용자 정보 확인 API 호출
      try {
        const userResponse = await authAPI.verifyUserInfo()
        setUser(userResponse.data.user_info)

        if (userResponse.status === 200) {
          router.push('/kpi')
        } else {
          router.push('/logout')
        }
      } catch (userError) {
        console.error('❌ USER 데이터 조회 실패:', userError)
        router.push('/logout')
      }
    } else {
      console.error('토큰이 정상적으로 받아지지 않았습니다.')
      router.push('/logout')
    }
    
  } catch (error) {
    console.error('OAuth 콜백 처리 오류:', error)
    clearPKCEStorage()
    router.push('/logout')
  }
})()
</script>

<style scoped>
.oauth-callback {
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

.oauth-callback p {
  color: #666;
  font-size: 14px;
}
</style>

