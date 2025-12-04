<template>
  <div class="logout-container">
    <div class="logout-card">
      <div class="logout-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </div>
      
      <h1 class="logout-title">로그아웃 되었습니다</h1>
      <p class="logout-message">안전하게 로그아웃되었습니다.<br>다시 로그인하시겠습니까?</p>
      
      <button @click="handleLogin" class="login-button">
        로그인
      </button>
    </div>
  </div>
</template>

<script setup>
import { buildAuthorizationUrl } from '@/config/oauthConfig'
import { useRouter } from 'vue-router'

const router = useRouter()
const handleLogin = () => {
  router.push('/')
}
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 245, 245, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  padding: 2rem;
}

.logout-card {
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

.logout-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    #dc2626 0%, 
    #ef4444 25%, 
    #dc2626 50%, 
    #ef4444 75%, 
    #dc2626 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
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

.logout-card:hover {
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(220, 38, 38, 0.1);
  transform: translateY(-2px);
}

.logout-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-radius: 20px;
  animation: iconFloat 0.6s ease-out;
  position: relative;
}

.logout-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-radius: 22px;
  opacity: 0.1;
  z-index: -1;
}

.logout-icon svg {
  color: #dc2626;
}

@keyframes iconFloat {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.logout-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  animation: fadeIn 0.5s ease-out 0.1s both;
}

.logout-message {
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-button {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
  width: 100%;
  animation: fadeIn 0.5s ease-out 0.3s both;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.login-button:active,
.login-button:focus {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.3);
  outline: none;
}

/* 반응형 디자인 (태블릿) */
@media (max-width: 768px) {
  .logout-container {
    padding: 1.5rem;
  }

  .logout-card {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }

  .logout-title {
    font-size: 1.5rem;
  }

  .logout-message {
    font-size: 0.95rem;
  }

  .logout-icon {
    width: 64px;
    height: 64px;
  }

  .logout-icon svg {
    width: 48px;
    height: 48px;
  }
}

/* 반응형 디자인 (모바일) */
@media (max-width: 480px) {
  .logout-container {
    padding: 1rem;
  }

  .logout-card {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }

  .logout-title {
    font-size: 1.25rem;
  }

  .logout-message {
    font-size: 0.9rem;
  }

  .logout-icon {
    width: 56px;
    height: 56px;
  }

  .logout-icon svg {
    width: 40px;
    height: 40px;
  }

  .login-button {
    font-size: 0.95rem;
    padding: 0.75rem 2rem;
  }
}
</style>

