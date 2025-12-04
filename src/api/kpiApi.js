import axiosInstance from './axiosInstance'

export const kpiAPI = {
  // KPI 모바일 데이터 조회 (8081 포트 백엔드)
  // POST /neofass-api/multi-devices/mobile/kpi (Vite 프록시 사용)
  // Body: { ls_ct_cd: "물류센터코드" }
  getKpiMobile: (searchInfo) => {
    return axiosInstance.post('/api/v1/devices/mobile/kpi', {
      ls_ct_cd: searchInfo.lsCtCd,
      date : searchInfo.date
    })
  },
}

