# API Sports API 통합 가이드

이 프로젝트는 API Sports API를 사용하여 최신 경기 결과 및 일정을 가져옵니다.

## 설정 방법

### 1. API 키 발급

1. [API Sports 웹사이트](https://www.api-sports.io/)에 가입하세요
2. 대시보드에서 API 키를 발급받으세요
3. 무료 플랜의 경우 일일 요청 횟수 제한이 있습니다

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_SPORTS_KEY=your_api_key_here
```

`.env` 파일은 Git에 커밋되지 않도록 `.gitignore`에 포함되어 있습니다.

### 3. 개발 서버 재시작

환경 변수를 변경한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

## 지원하는 리그

현재 다음 리그를 지원합니다:

- **EPL (Premier League)**: API Sports API 사용
- **NFL**: Supabase 데이터베이스 사용 (API Sports 미지원)
- **NBA**: 준비중
- **MLB**: 준비중

## 동작 방식

1. API 키가 설정되어 있고 EPL 리그인 경우, API Sports API를 사용하여 최신 경기 일정을 가져옵니다
2. API 키가 없거나 API 호출이 실패한 경우, Supabase 데이터베이스로 자동 fallback됩니다
3. EPL 경기 시간은 자동으로 KST(한국 표준시)로 변환됩니다

## API Sports API 엔드포인트

- **Base URL**: `https://v3.football.api-sports.io`
- **헤더**: `x-apisports-key: YOUR_API_KEY`
- **주요 엔드포인트**:
  - `/teams`: 팀 정보 조회
  - `/fixtures`: 경기 일정 조회

## 문제 해결

### API 키 오류

- 환경 변수 이름이 `VITE_API_SPORTS_KEY`인지 확인하세요 (VITE_ 접두사 필수)
- `.env` 파일이 프로젝트 루트에 있는지 확인하세요
- 개발 서버를 재시작했는지 확인하세요

### API 호출 실패

- API 키가 유효한지 확인하세요
- 일일 요청 제한을 초과하지 않았는지 확인하세요
- 네트워크 연결을 확인하세요
- API 호출이 실패하면 자동으로 Supabase로 fallback됩니다

### 시간대 문제

- EPL 경기 시간은 자동으로 KST로 변환됩니다
- UTC 시간을 UK 시간(GMT)으로 간주하고 9시간을 더해 KST로 변환합니다

