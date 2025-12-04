<template>
  <div class="default-layout">
    <!-- 헤더 -->
    <header class="layout-header">
      <nav class="nav">
        <!-- 로고 -->
        <router-link to="/" class="logo">
          <img :src="elandLogo" alt="이랜드 로고" class="logo-image" />
        </router-link>
        
        <!-- 메뉴 영역 -->
        <div class="nav-menu">
          <!-- 메뉴 버튼 -->
          <button 
            @click="toggleMenu" 
            class="menu-toggle"
            :aria-expanded="isMenuOpen"
            aria-label="메뉴"
          >
            <span class="navbar-toggler-icon"></span>
            <span class="navbar-toggler-icon"></span>
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <!-- 메뉴 목록 -->
          <div class="nav-links" :class="{ 'menu-open': isMenuOpen }">
            <router-link to="/kpi" @click="closeMenu" class="nav-link">KPI</router-link>
            <div class="user-info" v-if="userInfo">
              <span class="user-name">{{ userInfo.userName || userInfo.userId || '사용자' }}</span>
            </div>
            <button @click="handleLogout" class="logout-btn btn btn-outline-dark btn-sm">로그아웃</button>
          </div>
        </div>
      </nav>
    </header>
    
    <!-- 본문 -->
    <main class="layout-main">
      <slot />
    </main>
    
    <!-- 푸터 -->
    <footer class="layout-footer">
      <p>&copy; 2025 Neo. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/storesIndex'
import { clearPKCEStorage } from '@/config/oauthConfig'
import elandLogo from '@/assets/images/이랜드CI.png'

const router = useRouter()
const tokenStore = useTokenStore()

// 메뉴 토글 상태
const isMenuOpen = ref(false)

// 사용자 정보 (localStorage에서 가져오기)
const userInfo = computed(() => {
  try {
    const userInfoStr = localStorage.getItem('user_info')
    return userInfoStr ? JSON.parse(userInfoStr) : null
  } catch {
    return null
  }
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleLogout = () => {
  closeMenu()
  
  console.log('🔐 로그아웃 처리 시작')
  
  // Pinia Store 토큰 삭제
  tokenStore.clearAccessToken()
  tokenStore.clearRefreshToken()
  
  // localStorage 삭제
  localStorage.removeItem('user_info')
  localStorage.removeItem('authorization_code')
  localStorage.removeItem('oauth_state')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('token_expires_at')
  
  // sessionStorage 삭제 (PKCE 관련)
  clearPKCEStorage()
  
  console.log('✅ 로그아웃 완료 - 모든 인증 데이터 삭제됨')
  
  // 로그아웃 페이지로 이동
  router.push('/logout')
}

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event) => {
  if (!event.target.closest('.nav-menu')) {
    closeMenu()
  }
}

// 컴포넌트 마운트 시 이벤트 리스너 추가
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 레이아웃 기본 구조 */
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff5f5;
}

/* ========== 헤더 ========== */
.layout-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo:active,
.logo:focus {
  outline: none;
}

.logo-image {
  max-height: 40px;
  width: auto;
  object-fit: contain;
}

/* 메뉴 영역 */
.nav-menu {
  position: relative;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s;
}

.navbar-toggler-icon {
  display: block;
  width: 24px;
  height: 2px;
  background: #000000;
  transition: all 0.3s;
}

.menu-toggle:hover .navbar-toggler-icon {
  background: #dc2626;
}

.menu-toggle:active,
.menu-toggle:focus {
  outline: none;
  background: #fff5f5;
  border-radius: 4px;
}

/* 네비게이션 링크 */
.nav-links {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.nav-links.menu-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-link {
  text-decoration: none;
  color: #000000;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-weight: 500;
  width: 100%;
  text-align: left;
  display: block;
  margin: 0.25rem 0;
}

.nav-link:hover {
  background: #fff5f5;
  color: #dc2626;
}

.nav-link:active,
.nav-link:focus {
  background: #dc2626;
  color: white;
  outline: none;
}

.nav-link.router-link-active {
  background: #dc2626;
  color: white;
}

/* 사용자 정보 */
.user-info {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  margin: 0.5rem 0;
  width: 100%;
  text-align: left;
}

.user-name {
  color: #000000;
  font-size: 0.9rem;
}

/* 로그아웃 버튼 */
.logout-btn {
  padding: 0.75rem 1rem;
  background: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  width: 100%;
  text-align: left;
  margin: 0.25rem 0;
}

.logout-btn:hover {
  background: #1f2937;
}

.logout-btn:active,
.logout-btn:focus {
  background: #111827;
  outline: none;
  box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.3);
}

/* ========== 본문 ========== */
.layout-main {
  flex: 1;
  padding: 0;
  padding-top: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
  background: #ffffff;
}

/* ========== 푸터 ========== */
.layout-footer {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #000000;
  margin-top: auto;
}

.layout-footer p {
  margin: 0;
  font-size: 0.875rem;
}

/* ========== 반응형 (태블릿) ========== */
@media (max-width: 1024px) {
  .nav {
    padding: 1rem 1.5rem;
  }

  .layout-main {
    padding: 0;
    padding-top: 2rem;
  }
}

/* ========== 반응형 (모바일) ========== */
@media (max-width: 768px) {
  .nav {
    padding: 0.75rem 1rem;
  }

  .logo-image {
    max-height: 32px;
  }

  .user-name {
    font-size: 0.85rem;
  }

  .layout-main {
    padding: 0;
    padding-top: 2rem;
  }

  .layout-footer {
    padding: 1rem;
    font-size: 0.8rem;
  }
}

/* ========== 반응형 (작은 모바일) ========== */
@media (max-width: 480px) {
  .nav {
    padding: 0.5rem;
  }

  .logo-image {
    max-height: 28px;
  }

  .menu-toggle {
    padding: 0.4rem;
  }

  .navbar-toggler-icon {
    width: 20px;
  }

  .nav-links {
    min-width: 180px;
  }

  .layout-main {
    padding: 0;
    padding-top: 2rem;
  }

  .layout-footer {
    padding: 0.75rem;
    font-size: 0.75rem;
  }
}
</style>

