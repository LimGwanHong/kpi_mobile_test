# Nginx 설정 가이드

## 개요

이 프로젝트는 Vue.js SPA를 Nginx로 서빙하기 위한 설정을 포함합니다.

## 파일 구조

```
nginx/
├── nginx.dev.conf      # 개발 환경 설정
├── nginx.prd.conf      # 운영 환경 설정
└── README.md           # 이 파일
```

## 설정 설명

### nginx.prd.conf (운영)

- **포트**: 80
- **루트**: `/application/ehub_mobile-kpi/dist` (배포된 정적 파일)
- **API 프록시**: `/back` 요청을 백엔드 서버(`localhost:8080`)로 프록시
- **SPA 라우팅**: `try_files $uri $uri/ /index.html`
- **Gzip/캐싱**: 정적 자산 1년 캐싱 및 Gzip 활성화
- **보안 헤더**: X-Frame-Options, X-Content-Type-Options 등 기본 보안 헤더 포함

### nginx.dev.conf (개발)

- **포트**: 5174
- **캐싱 비활성화**: 개발 모드에서는 캐싱 없음
- **API 프록시**: `/api/kpis/`와 `/api`를 로컬 백엔드로 프록시
- **상세 로그**: 개발용 access/error 로그 별도 기록

## 사용 방법

### 프로덕션 배포

```bash
# 1. Vue 앱 빌드
npm run build:prd

# 2. Nginx 설정 파일 복사
sudo cp nginx/nginx.prd.conf /etc/nginx/sites-available/ehub-kpi
sudo ln -s /etc/nginx/sites-available/ehub-kpi /etc/nginx/sites-enabled/

# 3. 빌드된 파일 복사
sudo cp -r dist/* /application/ehub_mobile-kpi/dist/

# 4. Nginx 재시작
sudo nginx -t  # 설정 테스트
sudo systemctl restart nginx
```

### 로컬 개발

개발 모드에서는 Vite 개발 서버를 직접 사용하는 것을 권장합니다:

```bash
npm run dev
```

또는 Nginx로 개발 서버를 프록시하려면 `nginx.dev.conf`를 사용하세요.

## API 프록시 설정

### 백엔드 서버 주소 변경

`nginx.prd.conf` 혹은 `nginx.dev.conf` 파일에서 다음 부분을 수정:

```nginx
upstream backend {
    server your-backend-server:3000;  # 백엔드 서버 주소
}
```

### 로컬 개발 시

백엔드 서버가 로컬에서 실행되는 경우:

```nginx
upstream backend {
    server localhost:3000;  # 로컬 백엔드 서버
}

# 또는 직접 proxy_pass 사용
location /api {
    proxy_pass http://localhost:3000;  # 로컬 백엔드
    # ... 나머지 설정
}
```

## CORS 설정

현재 설정은 모든 Origin을 허용합니다 (`*`). 프로덕션에서는 특정 도메인만 허용하도록 변경하세요:

```nginx
add_header Access-Control-Allow-Origin "https://yourdomain.com";
```

## 환경 변수

### Vite 환경 변수

`.env.production` 파일에 API 베이스 URL 설정:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

또는 Nginx를 통해 프록시하는 경우:

```env
VITE_API_BASE_URL=/api
```

## 문제 해결

### 1. 404 에러 (Vue Router)

`try_files` 설정이 제대로 되어 있는지 확인:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. API 요청 실패

- 백엔드 서버가 실행 중인지 확인
- 프록시 설정의 `proxy_pass` 주소 확인
- CORS 설정 확인

### 3. 정적 파일 로딩 실패

- 빌드된 파일이 `/usr/share/nginx/html`에 있는지 확인
- 파일 권한 확인: `chmod -R 755 /usr/share/nginx/html`

## 로그 확인

```bash
# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# Nginx 액세스 로그
sudo tail -f /var/log/nginx/access.log
```

## 성능 최적화

### Gzip 압축

이미 활성화되어 있습니다. 필요시 추가 타입 설정:

```nginx
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 캐싱 전략

- 정적 파일: 1년 캐싱
- HTML 파일: 캐싱 없음 (SPA 업데이트 반영)

## 보안 설정

현재 포함된 보안 헤더:
- `X-Frame-Options`: 클릭재킹 방지
- `X-Content-Type-Options`: MIME 타입 스니핑 방지
- `X-XSS-Protection`: XSS 공격 방지

추가로 설정 가능한 항목:
- HTTPS 리다이렉트
- Rate limiting
- SSL/TLS 설정

