import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTokenStore = defineStore('tokenStorage', () => {
  // State: in-memory access token 저장
  const accessToken = ref(null)

  // Actions
  const setAccessToken = (token) => {
    accessToken.value = token
  }

  const getAccessToken = () => {
    return accessToken.value
  }

  const clearAccessToken = () => {
    accessToken.value = null
  }

  // Cookie 헬퍼 함수들
  const setCookie = (name, value, days = 7) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
  }

  const getCookie = (name) => {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }

  const setRefreshToken = (token, days = 30) => {
    setCookie('refresh_token', token, days)
  }

  const getRefreshToken = () => {
    return getCookie('refresh_token')
  }

  const clearRefreshToken = () => {
    deleteCookie('refresh_token')
  }

  const clearAll = () => {
    clearAccessToken()
    clearRefreshToken()
  }

  return {
    // State
    accessToken,
    // Actions
    setAccessToken,
    getAccessToken,
    clearAccessToken,
    setRefreshToken,
    getRefreshToken,
    clearRefreshToken,
    clearAll,
    // Cookie helpers
    setCookie,
    getCookie,
    deleteCookie
  }
})
