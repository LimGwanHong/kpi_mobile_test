# 외부 EHUB KPI 조회  테스트 프로젝트

외부에서 EHUB KPI를 조회하는 프로젝트입니다.

## 기술 스택

| 기술 | 버전 | 설명 |
|------|------|------|
| Vue | ^3.4.21 | 프론트엔드 프레임워크 |
| Pinia | ^2.1.7 | 상태 관리 |
| Vue Router | ^4.2.5 | 라우팅 |
| Axios | ^1.6.7 | HTTP 클라이언트 |
| Vite | ^5.1.6 | 빌드 도구 |
| Bootstrap | ^5.3.2 | UI 프레임워크 |
| Nginx | - | 웹 서버 |
| Node.js | ≥18.0.0 | JavaScript 런타임 |
| npm | ≥9.0.0 | 패키지 매니저 |

## 프로젝트 구조

```
src/
├── api/                    # API 모듈
├── assets/                 # 정적 리소스
├── config/                 # 설정 파일
├── layout/                 # 레이아웃 컴포넌트
├── modules/                # 기능별 모듈
│   ├── auth/               # 인증 모듈
│   ├── kpi/                # KPI 모듈
│   └── common/             # 공통 모듈
├── router/                 # 라우팅 설정
├── stores/                 # Pinia 상태 관리
├── utils/                  # 유틸리티 함수
├── App.vue                 # 루트 컴포넌트
└── main.js                 # 앱 진입점
nginx/                      # Nginx 설정
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 빌드 및 배포

### 개발 서버 빌드

```bash
npm run build:dev
```

### 운영 서버 빌드

```bash
npm run build:prd
```

- 빌드된 파일은 `dist/` 폴더에 생성

## Nginx 실행 (배포 환경)

### 개발 서버

```bash
npm run nginx.dev
```

### 운영 서버

```bash
npm run nginx.prd
```

### Nginx 제어

```bash
npm run nginx.stop     # 중지
npm run nginx.reload   # 재시작
npm run nginx.test     # 설정 테스트
```

## 환경변수 파일

| 파일 | 용도 | 적용 시점 |
|------|------|----------|
| `.env` | 공통 설정 | 모든 환경 |
| `.env.dev` | 개발 서버 | `npm run build:dev` |
| `.env.prd` | 운영 서버 | `npm run build:prd` |

### 환경변수 목록

| 변수명 | 설명 | 설정 파일 |
|--------|------|----------|
| `VITE_OAUTH_SCOPE` | OAuth 스코프 | `.env` |
| `VITE_OAUTH_RESPONSE_TYPE` | OAuth 응답 타입 | `.env` |
| `VITE_OAUTH_TOKEN_ENDPOINT` | 토큰 엔드포인트 | `.env` |
| `VITE_OAUTH_CODE_CHALLENGE_METHOD` | PKCE 코드 챌린지 방식 | `.env` |
| `VITE_OAUTH_AUTHORIZATION_ENDPOINT` | OAuth 인증 엔드포인트 | `.env.dev`, `.env.prd` |
| `VITE_OAUTH_REDIRECT_URI` | OAuth 리다이렉트 URI | `.env.dev`, `.env.prd` |
| `VITE_OAUTH_CLIENT_ID` | OAuth 클라이언트 ID | `.env.dev`, `.env.prd` |
| `VITE_OAUTH_CLIENT_SECRET` | OAuth 클라이언트 Secret | `.env.dev`, `.env.prd` |
| `VITE_OAUTH_USERINFO_ENDPOINT` | 사용자 정보 엔드포인트 | `.env.dev`, `.env.prd` |

### 환경변수 설정 예시

**.env (공통)**
```env
VITE_OAUTH_SCOPE=read write
VITE_OAUTH_RESPONSE_TYPE=code
VITE_OAUTH_TOKEN_ENDPOINT=/oauth2/token
VITE_OAUTH_CODE_CHALLENGE_METHOD=S256
```

**.env.dev (개발)**
```env
VITE_OAUTH_AUTHORIZATION_ENDPOINT=https://dev.example.com/oauth2/authorize
VITE_OAUTH_REDIRECT_URI=https://dev.example.com/oauth2/callback
VITE_OAUTH_CLIENT_ID=web-client-dev
VITE_OAUTH_USERINFO_ENDPOINT=https://dev.example.com/oauth/userinfo
```

**.env.prd (운영)**
```env
VITE_OAUTH_AUTHORIZATION_ENDPOINT=https://example.com/oauth2/authorize
VITE_OAUTH_REDIRECT_URI=https://example.com/oauth2/callback
VITE_OAUTH_CLIENT_ID=web-client
VITE_OAUTH_USERINFO_ENDPOINT=https://example.com/oauth/userinfo
```

## 주요 기능

- ✅ OAuth2 + PKCE 인증
- ✅ 모듈형 아키텍처
- ✅ 레이아웃 시스템
- ✅ API 클라이언트 (Axios 인터셉터)
- ✅ 상태 관리 (Pinia)
- ✅ 환경별 설정 분리
- ✅ Nginx 환경별 설정

## 스크립트 목록

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 로컬 개발 서버 실행 (Vite) |
| `npm run build:dev` | 개발 서버 빌드 |
| `npm run build:prd` | 운영 서버 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run nginx.dev` | 개발 Nginx 실행 |
| `npm run nginx.prd` | 운영 Nginx 실행 |
| `npm run nginx.stop` | Nginx 중지 |
| `npm run nginx.reload` | Nginx 재시작 |
| `npm run nginx.test` | Nginx 설정 테스트 |

## 라이선스

MIT
