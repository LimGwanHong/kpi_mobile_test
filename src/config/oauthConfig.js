/**
 * OAuth 설정 - 환경변수 사용
 * 환경별 값은 .env, .env.local, .env.development, .env.production 파일에서 관리
 */
export const oauthConfig = {
  // OAuth 인증 서버 엔드포인트
  authorizationEndpoint: import.meta.env.VITE_OAUTH_AUTHORIZATION_ENDPOINT,
  
  // OAuth 클라이언트 ID
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,

  // OAuth 클라이언트 Secret
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
  
  // 리다이렉트 URI
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  
  // OAuth 스코프
  scope: import.meta.env.VITE_OAUTH_SCOPE,
  
  // 응답 타입
  responseType: import.meta.env.VITE_OAUTH_RESPONSE_TYPE,
  
  // OAuth 토큰 엔드포인트
  tokenEndpoint: import.meta.env.VITE_OAUTH_TOKEN_ENDPOINT,
  
  // 사용자 정보 엔드포인트
  userInfoEndpoint: import.meta.env.VITE_OAUTH_USERINFO_ENDPOINT,

  // PKCE 설정
  codeChallengeMethod: import.meta.env.VITE_OAUTH_CODE_CHALLENGE_METHOD
}

/**
 * Base64 URL-safe 인코딩
 * @param {Uint8Array} buffer
 * @returns {string}
 */
const base64UrlEncode = (buffer) => {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * CSRF 방지를 위한 state 생성
 */
const generateState = () => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * code_verifier 생성 (43-128자의 랜덤 문자열)
 * RFC 7636 스펙에 따라 [A-Z], [a-z], [0-9], "-", ".", "_", "~" 문자 사용
 * @returns {string} code_verifier
 */
export const generateCodeVerifier = () => {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  // Base64 URL-safe 인코딩
  return base64UrlEncode(array)
}

/**
 * code_challenge 생성 (code_verifier의 SHA-256 해시)
 * @param {string} codeVerifier
 * @returns {Promise<string>} code_challenge
 */
export const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

/**
 * PKCE 파라미터 생성 (code_verifier, code_challenge 쌍)
 * @returns {Promise<{codeVerifier: string, codeChallenge: string}>}
 */
export const generatePKCE = async () => {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  return { codeVerifier, codeChallenge }
}

/**
 * OAuth 인증 URL 생성 (기존 방식 - PKCE 미사용)
 */
export const buildAuthorizationUrl = () => {
  const params = new URLSearchParams({
    response_type: oauthConfig.responseType,
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: oauthConfig.scope,
    state: generateState()
  })
  
  return `${oauthConfig.authorizationEndpoint}?${params.toString()}`
}

/**
 * OAuth 인증 URL 생성 (PKCE 방식)
 * code_verifier를 sessionStorage에 저장하고 code_challenge를 포함한 URL 반환
 * @returns {Promise<string>} OAuth 인증 URL
 */
export const buildAuthorizationUrlWithPKCE = async () => {
  const { codeVerifier, codeChallenge } = await generatePKCE()
  
  // code_verifier를 sessionStorage에 저장 (토큰 교환 시 필요)
  sessionStorage.setItem('pkce_code_verifier', codeVerifier)
  
  const state = generateState()
  sessionStorage.setItem('oauth_state', state)
  
  const params = new URLSearchParams({
    response_type: oauthConfig.responseType,
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: oauthConfig.scope,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: oauthConfig.codeChallengeMethod
  })
  
  console.log('🔐 PKCE 파라미터 생성')
  console.log('- code_verifier:', codeVerifier.substring(0, 20) + '...')
  console.log('- code_challenge:', codeChallenge.substring(0, 20) + '...')
  console.log('- code_challenge_method:', oauthConfig.codeChallengeMethod)
  
  return `${oauthConfig.authorizationEndpoint}?${params.toString()}`
}

/**
 * sessionStorage에서 code_verifier 가져오기
 * @returns {string|null} code_verifier
 */
export const getCodeVerifier = () => {
  return sessionStorage.getItem('pkce_code_verifier')
}

/**
 * PKCE 관련 sessionStorage 정리
 */
export const clearPKCEStorage = () => {
  sessionStorage.removeItem('pkce_code_verifier')
  sessionStorage.removeItem('oauth_state')
}

