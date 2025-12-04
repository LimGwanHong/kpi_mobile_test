<template>
  <div class="kpi-view">
    <div class="kpi-panel card shadow-lg border-0">
      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <!-- 필터 섹션 -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-label">센터</div>
          <div class="filter-value">{{ warehouseCenterName }}</div>
        </div>
        <div class="filter-row">
          <div class="filter-label">조회일자</div>
          <div class="filter-value date-filter">
            <input 
              v-model="selectedDate" 
              type="date" 
              class="date-input form-control"
              :max="todayDate"
            />
            <button @click="fetchKpiData" class="search-button btn btn-danger" :disabled="loading">
              <span v-if="!loading">조회</span>
              <span v-else>조회 중...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 일반배송 섹션 -->
      <div class="delivery-section">
        <div class="section-title">
          <img :src="packageIcon" alt="일반배송" class="section-icon" />
          <span class="section-text">일반배송</span>
        </div>
        <!-- 데이터 그룹 -->
        <div class="data-group">
          <div class="data-row">
            <div class="data-label">주문건수</div>
            <div class="data-value">
              {{ formatNumber(generalDelivery.orderCount) }}건 / {{ formatNumber(generalDelivery.orderPcs) }} PCS
            </div>
          </div>
          <div class="data-row">
            <div class="data-label">출하지시</div>
            <div class="data-value">
              {{ formatNumber(generalDelivery.shipmentInstruction) }}건 / {{ formatNumber(generalDelivery.shipmentPcs) }} PCS
            </div>
          </div>
          <div class="data-row">
            <div class="data-label">출하완료</div>
            <div class="data-value">{{ formatNumber(generalDelivery.shipmentCompleted) }} PCS</div>
          </div>
          <div class="data-row">
            <div class="data-label">진행률</div>
            <div class="data-value">{{ calculateProgress(generalDelivery.orderPcs, generalDelivery.shipmentPcs, generalDelivery.shipmentCompleted) }}%</div>
          </div>
        </div>
      </div>

      <!-- 빠른배송 섹션 -->
      <div class="delivery-section">
        <div class="section-title">
          <img :src="lightningIcon" alt="빠른배송" class="section-icon" />
          <span class="section-text">빠른배송</span>
        </div>
        <!-- 데이터 그룹 -->
        <div class="data-group">
          <div class="data-row">
            <div class="data-label">주문건수</div>
            <div class="data-value">
              {{ formatNumber(fastDelivery.orderCount) }}건 / {{ formatNumber(fastDelivery.orderPcs) }} PCS
            </div>
          </div>
          <div class="data-row">
            <div class="data-label">출하지시</div>
            <div class="data-value">
              {{ formatNumber(fastDelivery.shipmentInstruction) }}건 / {{ formatNumber(fastDelivery.shipmentPcs) }} PCS
            </div>
          </div>
          <div class="data-row">
            <div class="data-label">출하완료</div>
            <div class="data-value">{{ formatNumber(fastDelivery.shipmentCompleted) }} PCS</div>
          </div>
          <div class="data-row">
            <div class="data-label">진행률</div>
            <div class="data-value">{{ calculateProgress(fastDelivery.orderPcs, fastDelivery.shipmentPcs, fastDelivery.shipmentCompleted) }}%</div>
          </div>
        </div>
      </div>

      <!-- 로딩 모달 -->
      <Transition name="fade">
        <div v-if="loading" class="loading-modal">
          <div class="loading-modal-content">
            <div class="loading-wrapper">
              <div class="modern-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
              <div class="loading-content">
                <p class="loading-text">데이터를 불러오는 중</p>
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { kpiAPI } from '@/api/kpiApi'
import { formatDate } from '@/utils/date'
import packageIcon from '@/assets/icons/package.svg'
import lightningIcon from '@/assets/icons/lightning.svg'

// 사용자 정보 (localStorage에서 가져오기)
const userInfo = computed(() => {
  try {
    const userInfoStr = localStorage.getItem('user_info')
    return userInfoStr ? JSON.parse(userInfoStr) : null
  } catch {
    return null
  }
})

// 센터 정보 (로그인한 사용자의 물류센터)
const warehouseCenterName = computed(() => {
  return userInfo.value?.ls_ct_nm || '센터 정보 없음'
})

// 센터 코드
const warehouseCenterCode = computed(() => {
  return userInfo.value?.ls_ct_cd || null
})

// 오늘 날짜 (YYYY-MM-DD 형식)
const todayDate = computed(() => formatDate(new Date()))

// 선택된 조회일자 (기본값: 오늘)
const selectedDate = ref(todayDate.value)

// 데이터 상태
const generalDelivery = ref({
  orderCount: 0,
  orderPcs: 0,
  shipmentCompleted: 0,
  shipmentInstruction: 0,
  shipmentPcs: 0
})

const fastDelivery = ref({
  orderCount: 0,
  orderPcs: 0,
  shipmentCompleted: 0,
  shipmentInstruction: 0,
  shipmentPcs: 0
})

const loading = ref(false)
const error = ref(null)

// 숫자 포맷팅 (천 단위 구분)
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return Number(num).toLocaleString('ko-KR')
}

// 진행률 계산 (%)
// 출하완료 수량 / (주문수량 + 출하지시 수량 + 출하완료 수량) * 100
const calculateProgress = (orderPcs, shipmentPcs, completedPcs) => {
  const total = orderPcs + shipmentPcs + completedPcs
  if (!total || total === 0) return '0.0'
  const progress = (completedPcs / total) * 100
  return progress.toFixed(1)
}

// KPI 데이터 조회 (8081 포트 백엔드 API 사용)
const fetchKpiData = async () => {
  if (!warehouseCenterCode.value) {
    error.value = '물류센터 정보가 없습니다.'
    return
  }

  if (!selectedDate.value) {
    error.value = '조회일자를 선택해주세요.'
    return
  }

  loading.value = true
  error.value = null

  try {
    // 물류센터 코드와 날짜로 KPI 데이터 조회
    const searchInfo = {
      lsCtCd: warehouseCenterCode.value,
      date: selectedDate.value
    }
    const response = await kpiAPI.getKpiMobile(searchInfo)
    const responseData = response.data?.data || response.data
    
    if (responseData) {
      // 배열에서 첫 번째 요소 추출
      const normalShipFinInfo = responseData[0] || {};
      const expressShipFinInfo = responseData[1] || {};

      // 일반배송 데이터
      generalDelivery.value = {
        orderCount: normalShipFinInfo.DELI_INDI_CNT_BY_WEEKLY || 0,
        orderPcs: normalShipFinInfo.DELI_INDI_QTY_BY_WEEKLY || 0,
        shipmentCompleted: normalShipFinInfo.SHIP_FINI_CNT_BY_DAY || 0,
        shipmentInstruction: normalShipFinInfo.SHIP_INDI_CNT_BY_DAY || 0,
        shipmentPcs: normalShipFinInfo.SHIP_INDI_QTY_BY_DAY || 0
      }

      // 빠른배송 데이터
      fastDelivery.value = {
        orderCount: expressShipFinInfo.DELI_CNT || 0,
        orderPcs: expressShipFinInfo.DELI_QTY || 0,
        shipmentCompleted: expressShipFinInfo.SHIP_FINI_QTY || 0,
        shipmentInstruction: expressShipFinInfo.SHIP_INDI_CNT || 0,
        shipmentPcs: expressShipFinInfo.SHIP_INDI_QTY || 0
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '데이터를 불러오는데 실패했습니다.'
    console.error('KPI 데이터 조회 실패:', err)
    console.error('응답 데이터:', err.response?.data)
  } finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시 오늘 날짜로 자동 조회
onMounted(() => {
  fetchKpiData()
})
</script>

<style scoped>
.kpi-view {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: calc(100vh - 200px);
}

.kpi-panel {
  width: 100%;
  max-width: 900px;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(220, 38, 38, 0.05);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.5s ease-out;
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

.kpi-panel:hover {
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(220, 38, 38, 0.1);
  transform: translateY(-2px);
}

.filter-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(255, 245, 245, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
}

.filter-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.filter-row:last-child {
  border-bottom: none;
}

.filter-row:hover {
  background: rgba(255, 245, 245, 0.5);
}

.filter-label {
  padding: 1.125rem 1.5rem;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(255, 245, 245, 0.3) 100%);
  letter-spacing: -0.02em;
}

.filter-value {
  padding: 1.125rem 1.5rem;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 500;
  border-right: none;
  display: flex;
  align-items: center;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-input {
  flex: 1;
  padding: 0.875rem;
  border: 1px solid #000000;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
  background: #ffffff;
  transition: all 0.2s;
  cursor: pointer;
  box-sizing: border-box;
}

.date-input:hover {
  border-color: #000000;
}

.date-input:focus {
  outline: none;
  border-color: #dc2626;
  background: #fff5f5;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.date-input:active {
  border-color: #dc2626;
}

.search-button {
  padding: 0.875rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  background: #b91c1c;
}

.search-button:active:not(:disabled),
.search-button:focus:not(:disabled) {
  background: #991b1b;
  outline: none;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.3);
  transform: scale(0.98);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 1rem 1.5rem;
  margin: 1.5rem 1.5rem 1rem 1.5rem;
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  color: #dc2626;
  border-radius: 12px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  border: 2px solid rgba(220, 38, 38, 0.2);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
  animation: shake 0.5s ease-in-out;
  position: relative;
  z-index: 10;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.delivery-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.delivery-section:last-child {
  border-bottom: none;
}

.delivery-section:hover {
  background: rgba(255, 245, 245, 0.3);
}

.section-title {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: #1f2937;
  font-weight: 700;
  font-size: 1.1rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(255, 245, 245, 0.4) 100%);
  letter-spacing: -0.02em;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
}

.section-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.section-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(353deg) brightness(92%) contrast(86%);
}

.section-title:hover .section-icon {
  background: rgba(220, 38, 38, 0.15);
  transform: scale(1.1) rotate(5deg);
}

.section-text {
  flex: 1;
  font-weight: 700;
  font-size: 1.1rem;
}

.data-group {
  margin-bottom: 1.5rem;
}

.data-group:last-child {
  margin-bottom: 0;
}

.data-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  position: relative;
}

.data-row:last-child {
  border-bottom: none;
}

.data-row:hover {
  background: rgba(255, 245, 245, 0.4);
  transform: translateX(4px);
}

.data-row:hover .data-label {
  color: #dc2626;
}

.data-label {
  padding: 1.125rem 1.5rem;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  color: #4b5563;
  font-size: 0.95rem;
  font-weight: 600;
  transition: color 0.2s ease;
  letter-spacing: -0.01em;
}

.data-value {
  padding: 1.125rem 1.5rem;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  border-right: none;
  transition: all 0.2s ease;
}

.data-row:hover .data-value {
  color: #dc2626;
  font-weight: 700;
}

/* 로딩 모달 */
.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.loading-modal-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 3rem 4rem;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(220, 38, 38, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  min-width: 320px;
  position: relative;
  overflow: hidden;
}

.loading-modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    #dc2626 0%, 
    #ef4444 25%, 
    #dc2626 50%, 
    #ef4444 75%, 
    #dc2626 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.modern-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spinRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  border-top-color: #dc2626;
  border-width: 3px;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #ef4444;
  border-width: 3px;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #f87171;
  border-width: 3px;
  width: 50%;
  height: 50%;
  top: 25%;
  left: 25%;
}

@keyframes spinRing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  animation: pulseDot 1.4s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
}

.loading-dots span:nth-child(1) {
  animation-delay: 0s;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulseDot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .loading-modal-content,
.fade-leave-active .loading-modal-content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.fade-enter-from .loading-modal-content,
.fade-leave-to .loading-modal-content {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}

/* 반응형 디자인 (태블릿) */
@media (max-width: 1024px) {
  .kpi-view {
    padding: 1.5rem;
  }

  .kpi-panel {
    max-width: 100%;
  }

  .filter-row,
  .data-row {
    grid-template-columns: 140px 1fr;
  }

  .date-input {
    font-size: 0.95rem;
    padding: 0.75rem;
  }

  .search-button {
    font-size: 0.95rem;
    padding: 0.75rem 1.25rem;
  }
}

/* 반응형 디자인 (모바일) */
@media (max-width: 768px) {
  .kpi-view {
    padding: 1rem;
  }

  .kpi-panel {
    max-width: 100%;
  }

  .filter-row,
  .data-row {
    grid-template-columns: 120px 1fr;
    font-size: 0.9rem;
  }

  .filter-label,
  .filter-value,
  .data-label,
  .data-value {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }

  .section-title {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }

  .date-filter {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .date-input {
    flex: 1;
    min-width: 140px;
    font-size: 0.95rem;
    padding: 0.75rem;
  }

  .search-button {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .kpi-view {
    padding: 0.5rem;
  }

  .filter-row,
  .data-row {
    grid-template-columns: 90px 1fr;
    font-size: 0.85rem;
  }

  .filter-label,
  .filter-value,
  .data-label,
  .data-value {
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .section-title {
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .kpi-panel {
    border-radius: 16px;
  }
  
  .date-filter {
    gap: 0.5rem;
  }

  .date-input {
    flex: 1;
    min-width: 120px;
    font-size: 0.95rem;
    padding: 0.75rem;
  }

  .search-button {
    font-size: 0.95rem;
    padding: 0.75rem 0.875rem;
  }
}
</style>
