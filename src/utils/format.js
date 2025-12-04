/**
 * 포맷팅 관련 유틸리티 함수
 */

/**
 * 숫자를 천 단위 구분자로 포맷팅
 * @param {number|string} num - 숫자
 * @returns {string} 포맷된 숫자 문자열
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0'
  return Number(num).toLocaleString('ko-KR')
}

/**
 * 통화 포맷팅
 * @param {number|string} amount - 금액
 * @param {string} currency - 통화 기호 (기본: '₩')
 * @returns {string} 포맷된 통화 문자열
 */
export const formatCurrency = (amount, currency = '₩') => {
  if (amount === null || amount === undefined || amount === '') return `${currency} 0`
  return `${currency} ${formatNumber(amount)}`
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 포맷팅
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷된 파일 크기 (예: "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 전화번호 포맷팅
 * @param {string} phone - 전화번호
 * @returns {string} 포맷된 전화번호 (예: "010-1234-5678")
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  return phone
}

/**
 * 텍스트 자르기 (말줄임표 추가)
 * @param {string} text - 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 잘린 텍스트
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 이메일 마스킹
 * @param {string} email - 이메일
 * @returns {string} 마스킹된 이메일 (예: "abc***@example.com")
 */
export const maskEmail = (email) => {
  if (!email) return ''
  
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  
  const maskedLocal = localPart.length > 3
    ? localPart.substring(0, 3) + '*'.repeat(localPart.length - 3)
    : localPart.substring(0, 1) + '*'
  
  return `${maskedLocal}@${domain}`
}

