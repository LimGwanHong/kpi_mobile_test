# 프로덕션 배포 가이드

## 개요

이 가이드는 시스템에 직접 설치된 Nginx를 사용하여 Vue.js SPA를 프로덕션 환경에 배포하는 방법을 설명합니다.

## 배포 아키텍처

```
┌─────────────────┐
│   사용자 브라우저   │
└────────┬────────┘
         │ HTTP/HTTPS 요청
         ▼
┌─────────────────┐
│   Nginx (80/443) │  ← 시스템에 설치된 Nginx
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│  Vue    │ │ Backend  │
│  SPA    │ │ API      │
│ (dist/) │ │ (3000)   │
└────────┘ └──────────┘
```

## 배포 단계

### 1단계: 서버 준비

#### Nginx 설치 (Ubuntu/Debian)

```bash
# 패키지 업데이트
sudo apt update

# Nginx 설치
sudo apt install nginx -y

# Nginx 상태 확인
sudo systemctl status nginx
```

#### Nginx 설치 (CentOS/RHEL)

```bash
# Nginx 설치
sudo yum install nginx -y
# 또는
sudo dnf install nginx -y

# Nginx 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2단계: Vue 앱 빌드

**로컬 개발 머신에서:**

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/your/project

# 의존성 설치
npm ci

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la dist/
```

빌드 결과물:
- `dist/index.html` - 메인 HTML 파일
- `dist/assets/` - CSS, JS, 이미지 등 정적 파일

### 3단계: 서버에 파일 업로드

#### 방법 1: SCP 사용

```bash
# 빌드된 파일을 서버로 전송
scp -r dist/* user@your-server:/var/www/vue-app/

# 또는 전체 dist 폴더
scp -r dist user@your-server:/var/www/
```

#### 방법 2: rsync 사용 (권장)

```bash
# rsync로 동기화 (변경된 파일만 전송)
rsync -avz --delete dist/ user@your-server:/var/www/vue-app/
```

#### 방법 3: Git 사용

```bash
# 서버에서 직접 빌드
ssh user@your-server
cd /var/www/vue-app
git pull origin main
npm ci
npm run build
```

### 4단계: Nginx 설정

#### 설정 파일 위치

- **Ubuntu/Debian**: `/etc/nginx/sites-available/` 및 `/etc/nginx/sites-enabled/`
- **CentOS/RHEL**: `/etc/nginx/conf.d/`

#### 설정 파일 생성

```bash
# 프로젝트의 nginx 설정 파일을 서버로 복사
sudo cp nginx/nginx.prd.conf /etc/nginx/sites-available/ehub-kpi

# 또는 직접 편집
sudo nano /etc/nginx/sites-available/ehub-kpi
```

#### 설정 파일 내용 수정

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/vue-app;  # 빌드된 파일 위치로 변경
    
    # 업스트림 백엔드 서버 주소 수정
    upstream backend {
        server localhost:3000;  # 또는 실제 백엔드 서버 주소
    }
    
    # ... 나머지 설정
}
```

### 5단계: Nginx 설정 활성화

#### Ubuntu/Debian

```bash
# 심볼릭 링크 생성 (sites-enabled에 활성화)
sudo ln -s /etc/nginx/sites-available/vue-app /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 파일 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

#### CentOS/RHEL

```bash
# 설정 파일을 conf.d에 복사
sudo cp /etc/nginx/sites-available/vue-app /etc/nginx/conf.d/vue-app.conf

# 설정 파일 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 6단계: 파일 권한 설정

```bash
# 웹 서버 사용자에게 읽기 권한 부여
sudo chown -R www-data:www-data /var/www/vue-app  # Ubuntu/Debian
# 또는
sudo chown -R nginx:nginx /var/www/vue-app  # CentOS/RHEL

# 디렉토리 권한 설정
sudo chmod -R 755 /var/www/vue-app

# 파일 권한 설정
sudo find /var/www/vue-app -type f -exec chmod 644 {} \;
sudo find /var/www/vue-app -type d -exec chmod 755 {} \;
```

### 7단계: 방화벽 설정

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 'Nginx Full'
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
sudo ufw status

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 8단계: SSL/TLS 설정 (HTTPS)

#### Let's Encrypt 사용 (Certbot)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# 또는
sudo yum install certbot python3-certbot-nginx  # CentOS/RHEL

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 배포 후 확인

### 1. Nginx 상태 확인

```bash
# Nginx 실행 상태
sudo systemctl status nginx

# Nginx 로그 확인
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 웹사이트 접근 테스트

```bash
# 로컬에서 테스트
curl http://localhost

# 외부에서 테스트
curl http://your-domain.com

# API 프록시 테스트
curl http://your-domain.com/api/health
```

### 3. 브라우저에서 확인

- `http://your-domain.com` 접속
- Vue Router 라우팅 테스트
- API 요청이 정상적으로 프록시되는지 확인

## 업데이트 프로세스

### 자동화된 업데이트 스크립트

`scripts/update.sh` 생성:

```bash
#!/bin/bash

# Vue 앱 업데이트 스크립트

set -e

echo "🔄 업데이트 시작..."

# 1. 소스 코드 업데이트
git pull origin main

# 2. 의존성 업데이트
npm ci

# 3. 빌드
npm run build

# 4. 백업 (선택사항)
sudo cp -r /var/www/vue-app /var/www/vue-app.backup.$(date +%Y%m%d_%H%M%S)

# 5. 새 파일 배포
sudo rm -rf /var/www/vue-app/*
sudo cp -r dist/* /var/www/vue-app/

# 6. 권한 설정
sudo chown -R www-data:www-data /var/www/vue-app
sudo chmod -R 755 /var/www/vue-app

# 7. Nginx 재시작
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 업데이트 완료!"
```

실행 권한 부여:
```bash
chmod +x scripts/update.sh
```

## 주요 설정 설명

### 1. SPA 라우팅

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**설명**: Vue Router를 사용하는 SPA의 경우, 직접 파일이 없는 경로(예: `/users`, `/login`)에 대한 요청도 `index.html`을 반환해야 합니다. 브라우저에서 `index.html`을 로드한 후 Vue Router가 클라이언트 사이드에서 라우팅을 처리합니다.

### 2. API 프록시

```nginx
location /api {
    proxy_pass http://backend;
    # ... 프록시 헤더 설정
}
```

**설명**: 
- 클라이언트는 `/api/users`로 요청
- Nginx가 이를 `http://backend/users`로 프록시
- CORS 문제 해결 (같은 도메인으로 처리)
- 백엔드 서버 주소를 숨김

### 3. 정적 파일 캐싱

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**설명**: 
- 이미지, CSS, JS 파일은 1년간 캐싱
- 파일명에 해시가 포함되어 있으므로 안전
- 네트워크 트래픽 감소 및 로딩 속도 향상

### 4. Gzip 압축

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

**설명**: 
- 텍스트 파일을 압축하여 전송
- 전송 데이터 크기 약 70-80% 감소
- 페이지 로딩 속도 향상

## 문제 해결

### 1. 404 에러 (Vue Router)

**증상**: 직접 URL 접근 시 404 에러

**해결**:
```nginx
# try_files 설정 확인
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. API 요청 실패

**증상**: `/api` 요청이 502 Bad Gateway

**해결**:
- 백엔드 서버가 실행 중인지 확인
- `upstream backend` 주소 확인
- 방화벽 설정 확인

### 3. 정적 파일 로딩 실패

**증상**: CSS, JS 파일이 로드되지 않음

**해결**:
- 파일 경로 확인 (`dist/assets/`)
- 파일 권한 확인 (`chmod 644`)
- Nginx 에러 로그 확인

### 4. 권한 문제

**증상**: 403 Forbidden

**해결**:
```bash
sudo chown -R www-data:www-data /var/www/vue-app
sudo chmod -R 755 /var/www/vue-app
```

## 성능 최적화

### 1. 캐싱 전략

- **정적 파일**: 1년 캐싱 (파일명에 해시 포함)
- **HTML 파일**: 캐싱 없음 (항상 최신 버전)

### 2. 압축

- Gzip 압축 활성화
- Brotli 압축 (선택사항)

### 3. HTTP/2

```nginx
listen 443 ssl http2;
```

### 4. CDN 사용

- 정적 파일을 CDN으로 서빙
- CloudFlare, AWS CloudFront 등

## 보안 설정

### 1. 보안 헤더

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 2. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    proxy_pass http://backend;
}
```

### 3. HTTPS 강제

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 모니터링

### 로그 확인

```bash
# 실시간 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 실시간 에러 로그
sudo tail -f /var/log/nginx/error.log

# 특정 IP 추적
sudo grep "192.168.1.1" /var/log/nginx/access.log
```

### 성능 모니터링

```bash
# Nginx 상태 확인
sudo nginx -t

# 프로세스 확인
ps aux | grep nginx

# 연결 수 확인
netstat -an | grep :80 | wc -l
```

## 자동 배포 (CI/CD)

### GitHub Actions 예시

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/var/www/vue-app"
      
      - name: Restart Nginx
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            sudo chown -R www-data:www-data /var/www/vue-app
            sudo nginx -t && sudo systemctl reload nginx
```

이 방식은 Docker 없이 전통적인 웹 서버 배포 방식으로, 많은 프로덕션 환경에서 사용되는 안정적인 방법입니다.

