import axios from 'axios'
import { buildAuthorizationUrl } from '@/config/oauthConfig'
import { useTokenStore } from '@/stores/storesIndex'

// Axios 인스턴스 생성
// 개발 환경: Vite 프록시 사용 (/back → http://localhost:8081)
// 프로덕션: 실제 백엔드 URL 사용
const axiosInstance = axios.create({
  baseURL: '/back',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// tokenStore 인스턴스를 캐싱 (Pinia 초기화 후 사용)
let tokenStore = null

const getTokenStore = () => {
  if (!tokenStore) {
    try {
      tokenStore = useTokenStore()
    } catch (e) {
      console.warn('Pinia not initialized yet')
      return null
    }
  }
  return tokenStore
}

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const store = getTokenStore()

    if (store) {
      const accessToken = store.getAccessToken()
      console.log('accessToken', accessToken)

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 에러 타입 분석 함수
function analyzeErrorType(error) {
  // OPTIONS 요청(preflight) 실패
  if (error.config?.method?.toUpperCase() === 'OPTIONS') {
    return {
      type: 'PREFLIGHT_ERROR',
      isCors: true,
      description: 'Preflight (OPTIONS) 요청이 실패했습니다. CORS preflight 체크가 실패했을 가능성이 높습니다.'
    }
  }

  // 에러 코드 분석
  if (error.code === 'ERR_NETWORK') {
    // Network Error는 보통 CORS 오류를 의미
    if (error.message?.includes('CORS') || 
        error.message?.includes('Access-Control') ||
        error.message?.includes('Network Error')) {
      return {
        type: 'CORS_ERROR',
        isCors: true,
        description: 'CORS (Cross-Origin Resource Sharing) 오류입니다. 브라우저가 CORS 정책으로 인해 요청을 차단했습니다.'
      }
    }
    return {
      type: 'NETWORK_ERROR',
      isCors: false,
      description: '네트워크 오류입니다. 서버에 연결할 수 없습니다.'
    }
  }

  // 요청은 보냈지만 응답이 없는 경우
  if (error.request && !error.response) {
    // CORS 오류 가능성
    if (error.message?.includes('CORS') || 
        error.message?.includes('Access-Control') ||
        error.message?.includes('Network Error')) {
      return {
        type: 'CORS_ERROR',
        isCors: true,
        description: 'CORS 오류로 추정됩니다. 요청은 전송되었지만 브라우저가 응답을 차단했습니다.'
      }
    }
    
    // Preflight 실패 가능성 (POST, PUT, DELETE 등)
    const method = error.config?.method?.toUpperCase()
    if (method && !['GET', 'HEAD', 'POST'].includes(method)) {
      return {
        type: 'PREFLIGHT_ERROR',
        isCors: true,
        description: 'Preflight 오류 가능성이 있습니다. OPTIONS 요청이 실패했을 수 있습니다.'
      }
    }
    
    return {
      type: 'NO_RESPONSE',
      isCors: false,
      description: '서버로부터 응답을 받지 못했습니다. 네트워크 문제 또는 서버 오류일 수 있습니다.'
    }
  }

  // 서버 응답이 있는 경우
  if (error.response) {
    const status = error.response.status
    
    // Status 0은 CORS 오류
    if (status === 0) {
      return {
        type: 'CORS_ERROR',
        isCors: true,
        description: 'CORS 오류 (status 0). 브라우저가 응답을 차단했습니다.'
      }
    }
    
    // HTTP 오류
    return {
      type: 'HTTP_ERROR',
      isCors: false,
      description: `HTTP 오류 (status ${status}). 서버가 오류를 반환했습니다.`
    }
  }

  // 기타 오류
  return {
    type: 'UNKNOWN_ERROR',
    isCors: false,
    description: `알 수 없는 오류: ${error.message || '오류 메시지 없음'}`
  }
}

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 에러 타입 분석
    const errorType = analyzeErrorType(error)
    
    // 에러 정보 수집
    const timestamp = new Date().toISOString()
    const fullUrl = error.config 
      ? `${error.config.baseURL || ''}${error.config.url}`
      : 'Unknown URL'
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
    
    // 상세 에러 로그 출력
    console.group(`❌ [API Error] ${method} ${fullUrl}`)
    console.log('📅 Timestamp:', timestamp)
    
    // 에러 타입 및 CORS 여부 강조
    if (errorType.isCors) {
      console.error('🚫 CORS 오류:', errorType.type)
      console.error('📝 설명:', errorType.description)
    } else {
      console.error('⚠️ 오류 타입:', errorType.type)
      console.error('📝 설명:', errorType.description)
    }
    
    // 서버 응답이 있는 경우
    if (error.response) {
      console.log('📊 HTTP Status:', `${error.response.status} ${error.response.statusText}`)
      console.log('📥 Response Data:', error.response.data)
      console.log('📋 Response Headers:', error.response.headers)
      
      // CORS 헤더 확인
      const corsHeaders = {
        'Access-Control-Allow-Origin': error.response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': error.response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': error.response.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': error.response.headers['access-control-allow-credentials']
      }
      console.log('🌐 CORS Headers:', corsHeaders)
      
      // CORS 헤더가 없으면 경고
      if (errorType.isCors && !corsHeaders['Access-Control-Allow-Origin']) {
        console.warn('⚠️ 서버 응답에 CORS 헤더가 없습니다!')
      }
    } 
    // 요청은 보냈지만 응답이 없는 경우
    else if (error.request) {
      console.log('⚠️ 요청은 전송되었지만 응답을 받지 못했습니다')
      console.log('📡 Request Details:', {
        readyState: error.request.readyState,
        status: error.request.status,
        statusText: error.request.statusText
      })
      
      if (error.code) {
        console.log('🔌 Error Code:', error.code)
      }
      if (error.message) {
        console.log('💬 Error Message:', error.message)
      }
      
      // CORS 오류 상세 정보
      if (errorType.isCors) {
        console.log('🚫 CORS 오류 상세:')
        console.log('   - Origin:', window.location.origin)
        console.log('   - Target URL:', fullUrl)
        console.log('   - 가능한 원인:')
        console.log('     1. 서버가 이 Origin에서의 요청을 허용하지 않음')
        console.log('     2. Access-Control-Allow-Origin 헤더가 없음')
        console.log('     3. Preflight (OPTIONS) 요청이 실패함')
        console.log('   - 해결 방법:')
        console.log('     → 백엔드 서버에서 CORS 헤더를 설정해야 합니다')
      }
    } 
    // 요청 설정 중 오류
    else {
      console.log('⚠️ 요청 설정 중 오류 발생:', error.message)
    }
    
    console.log('🔍 Full Error Object:', error)
    console.groupEnd()
    
    // 401 에러 시 토큰 제거 및 로그아웃 페이지로 리다이렉트
    if (error.response?.status === 401) {
      // OAuth 토큰 교환 요청의 401은 리다이렉트하지 않음 (무한 루프 방지)
      const isTokenExchange = error.config?.url?.includes('token')
      
      if (!isTokenExchange) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expires_at')
        localStorage.removeItem('user_info')
        localStorage.removeItem('authorization_code')
        localStorage.removeItem('oauth_state')
        
        // OAuth 인증으로 리다이렉트
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance

