import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    // 프록시 설정
    proxy: {
      // '/back'로 시작하는 모든 요청을 백엔드로 프록시
      '/back': {
        target: 'http://localhost:8081',  // 백엔드 서버 주소
        changeOrigin: true,                // Origin 헤더 변경 (CORS 우회)
        secure: false,                     // HTTPS 인증서 검증 비활성화 (개발용)
        // 경로 재작성: /back를 제거하고 백엔드로 전달
        // 예: /back/multi-devices/mobile/kpi → http://localhost:8081/multi-devices/mobile/kpi
        rewrite: (path) => {
          const finalPath = path.replace(/^\/back/, '')
          console.log(`[Vite Proxy] ${path} → http://localhost:8081${finalPath}`)
          return finalPath
        },
        // 프록시 이벤트 로깅 (선택사항)
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Proxy Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})

