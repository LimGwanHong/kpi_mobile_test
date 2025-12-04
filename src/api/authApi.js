import axiosInstance from './axiosInstance'

/**
 * 인증 관련 API
 */
export const authAPI = {
  /**
   * 로그아웃 API
   * @returns {Promise} 로그아웃 응답
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/logout')
      return response
    } catch (error) {
      console.error('로그아웃 API 오류:', error)
      throw error
    }
  },

  /**
   * 사용자 정보 확인 API
   * @returns {Promise} 사용자 정보
   */
  verifyUserInfo: async () => {
    try {
      const response = await axiosInstance.get('/api/login/verifyUserInfo')
      return response
    } catch (error) {
      console.error('사용자 정보 확인 API 오류:', error)
      throw error
    }
  }
}

